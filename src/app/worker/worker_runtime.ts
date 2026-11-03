import { i18n } from '../i18n/i18n';
import { WorkerError } from './entities/worker_error';
import { WorkerMessage } from './entities/worker_message';
import { WorkerReply } from './entities/worker_reply';

export type WorkerHandler = (payload: unknown) => unknown | Promise<unknown>;

/** worker 作用域。 */
interface WorkerScope {
  /** 监听消息。 */
  onmessage: ((event: MessageEvent<unknown>) => void) | null;
  /** 发送消息。 */
  postMessage(message: unknown): void;
}

/** worker 线程按消息类型分发。业务异常回传给调用方，不关闭 worker。 */
export class WorkerRuntime {
  /** 监听消息并分发。 */
  listen(handlers: Record<string, WorkerHandler>): void {
    // 获取当前 worker 实例
    const scope = self as unknown as WorkerScope;
    // 监听消息
    scope.onmessage = (event: MessageEvent<unknown>) => {
      // 分发消息
      void this.dispatch(scope, handlers, event.data);
    };
  }

  /** 分发消息。 */
  private async dispatch(
    scope: WorkerScope,
    handlers: Record<string, WorkerHandler>,
    data: unknown,
  ): Promise<void> {
    let message: WorkerMessage;
    // 解析消息
    try {
      message = WorkerMessage.fromJson(data);
    } catch (error) {
      if (error instanceof WorkerError) return;
      throw error;
    }

    // 获取消息处理器
    const handler = handlers[message.type];
    // 如果消息处理器不存在，则发送失败回复
    if (!handler) {
      // 发送失败回复
      this.send(
        scope,
        WorkerReply.fail(
          message.id,
          new WorkerError(i18n.t('common.worker_unknown', { type: message.type })),
        ),
      );
      return;
    }

    try {
      // 执行消息处理器
      const payload = await handler(message.payload);
      // 发送成功回复
      this.send(scope, WorkerReply.ok(message.id, payload));
    } catch (error) {
      // 发送失败回复
      this.send(scope, WorkerReply.fail(message.id, WorkerError.from(error)));
    }
  }

  /** 发送回复。 */
  private send(scope: WorkerScope, reply: WorkerReply): void {
    // 发送回复
    try {
      scope.postMessage(reply.toJson());
    } catch (error) {
      scope.postMessage(WorkerReply.fail(reply.id, WorkerError.from(error)).toJson());
    }
  }
}
