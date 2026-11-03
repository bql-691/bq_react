import { i18n } from '../i18n/i18n';
import { WorkerError } from './entities/worker_error';
import { WorkerMessage } from './entities/worker_message';
import { WorkerReply } from './entities/worker_reply';

type Pending = {
  resolve: (payload: unknown) => void;
  reject: (error: WorkerError) => void;
};

/** 两次创建之间没有成功处理过消息，就停止再创建。 */
const MAX_CONSECUTIVE_CRASHES = 1;

export type WorkerFactory = () => Worker;

/** 管理一个 worker 实例的生命周期。
 * Worker使用示例：
 * ```ts
 * const worker = new WorkerSession(() => new Worker('worker.js'));
 * let workerMessage: WorkerMessage;
 * workerMessage = new WorkerMessage('type', { payload: [Entity].toJson() });
 * worker.request(workerMessage).then((result: [Entity].fromJson(result)) => {
 *   console.log(result);
 * });
 * ```
 */
export class WorkerSession {
  private worker: Worker | null = null;
  private readonly pending = new Map<string, Pending>();
  private consecutiveCrashes = 0;
  private stopped = false;

  constructor(private readonly createWorker: WorkerFactory) {}

  /** 发送消息并等待回复。 */
  request<T = unknown>(message: WorkerMessage): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      if (this.stopped) {
        reject(new WorkerError(i18n.t('common.worker_stopped')));
        return;
      }

      let worker: Worker;
      try {
        // 确保 worker 实例存在
        worker = this.ensure();
      } catch (error) {
        // 如果 worker 实例不存在，则拒绝请求
        // 并记录崩溃次数
        reject(WorkerError.from(error));
        return;
      }

      // 将请求添加到 pending 队列
      this.pending.set(message.id, {
        // 如果请求成功，则解析回复
        resolve: (value) => resolve(value as T),
        // 如果请求失败，则拒绝请求
        reject,
      });

      try {
        // 发送消息
        worker.postMessage(message.toJson());
      } catch (error) {
        // 如果请求失败，则删除请求
        this.pending.delete(message.id);
        // 并拒绝请求
        reject(WorkerError.from(error));
      }
    });
  }

  /** 销毁 worker 实例。 */
  dispose(): void {
    // 拒绝所有 pending 请求
    this.failPending(new WorkerError(i18n.t('common.worker_disposed')));
    // 销毁 worker 实例
    this.worker?.terminate();
    // 清空 worker 实例
    this.worker = null;
  }

  /** 确保 worker 实例存在。 */
  private ensure(): Worker {
    // 如果 worker 实例存在，则返回
    if (this.worker) return this.worker;

    let worker: Worker;
    // 创建 worker 实例
    try {
      worker = this.createWorker();
    } catch (error) {
      // 如果创建 worker 实例失败，则记录崩溃次数
      this.noteCrash();
      throw error;
    }

    // 监听消息
    worker.onmessage = (event: MessageEvent<unknown>) => {
      this.onMessage(event.data);
    };
    // 监听错误
    worker.onerror = (event) => {
      event.preventDefault();
      // 如果监听错误，则记录崩溃次数
      this.crash(worker, new WorkerError(event.message || i18n.t('common.worker_crashed')));
    };
    // 监听消息错误
    worker.onmessageerror = () => {
      // 如果监听消息错误，则记录崩溃次数
      this.crash(worker, new WorkerError(i18n.t('common.worker_deserialize_failed')));
    };

    // 设置 worker 实例
    this.worker = worker;
    // 返回 worker 实例
    return worker;
  }

  /** 处理消息。 */
  private onMessage(data: unknown): void {
    let reply: WorkerReply;
    // 解析回复
    try {
      // 如果解析回复失败，则返回
      reply = WorkerReply.fromJson(data);
    } catch (error) {
      // 如果解析回复失败，则返回
      if (error instanceof WorkerError) return;
      // 如果解析回复失败，则抛出错误
      throw error;
    }

    // 获取 pending 请求
    const pending = this.pending.get(reply.id);
    // 如果 pending 请求不存在，则返回
    if (!pending) return;

    // 删除 pending 请求
    this.pending.delete(reply.id);
    // 重置崩溃次数
    this.consecutiveCrashes = 0;

    try {
      // 如果解析回复成功，则解析回复
      pending.resolve(reply.unwrap());
    } catch (error) {
      // 如果解析回复失败，则拒绝请求
      pending.reject(WorkerError.from(error));
    }
  }

  /** 处理崩溃。 */
  private crash(worker: Worker, error: WorkerError): void {
    // 如果 worker 实例不存在，则返回
    if (this.worker !== worker) return;
    // 销毁 worker 实例
    this.worker = null;
    // 销毁 worker 实例
    worker.terminate();
    // 记录崩溃次数
    this.noteCrash();
    // 拒绝所有 pending 请求
    this.failPending(error);
  }

  /** 记录崩溃次数。 */
  private noteCrash(): void {
    // 记录崩溃次数
    this.consecutiveCrashes += 1;
    // 如果崩溃次数超过最大连续崩溃次数，则停止 worker
    if (this.consecutiveCrashes > MAX_CONSECUTIVE_CRASHES) this.stopped = true;
  }

  /** 拒绝所有 pending 请求。 */
  private failPending(error: WorkerError): void {
    // 获取 pending 请求
    const pending = [...this.pending.values()];
    // 清空 pending 请求
    this.pending.clear();
    // 拒绝所有 pending 请求
    pending.forEach((item) => item.reject(error));
  }
}
