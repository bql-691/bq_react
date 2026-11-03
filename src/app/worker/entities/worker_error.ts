import { i18n } from '../../i18n/i18n';

export class WorkerError extends Error {
  override readonly name = 'WorkerError';

  constructor(message: string) {
    super(message);
  }

  static from(error: unknown): WorkerError {
    if (error instanceof WorkerError) return error;
    if (error instanceof Error) return new WorkerError(error.message);
    return new WorkerError(String(error));
  }

  static fromJson(value: unknown): WorkerError {
    if (!value || typeof value !== 'object')
      throw new WorkerError(i18n.t('common.worker_invalid_error'));
    const body = value as { message?: unknown };
    if (typeof body.message !== 'string')
      throw new WorkerError(i18n.t('common.worker_invalid_error'));
    return new WorkerError(body.message);
  }

  toJson(): { name: string; message: string } {
    return { name: this.name, message: this.message };
  }
}
