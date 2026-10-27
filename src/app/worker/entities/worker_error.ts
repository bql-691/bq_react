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
    if (!value || typeof value !== 'object') throw new WorkerError('Invalid worker error');
    const body = value as { message?: unknown };
    if (typeof body.message !== 'string') throw new WorkerError('Invalid worker error');
    return new WorkerError(body.message);
  }

  toJson(): { name: string; message: string } {
    return { name: this.name, message: this.message };
  }
}
