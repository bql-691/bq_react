import { WorkerError } from './worker_error';

export class WorkerReply {
  readonly id: string;
  readonly payload: unknown;
  readonly error: WorkerError | null;

  private constructor(id: string, payload: unknown, error: WorkerError | null) {
    this.id = id;
    this.payload = payload;
    this.error = error;
  }

  static ok(id: string, payload: unknown): WorkerReply {
    return new WorkerReply(id, payload, null);
  }

  static fail(id: string, error: WorkerError): WorkerReply {
    return new WorkerReply(id, undefined, error);
  }

  static fromJson(value: unknown): WorkerReply {
    if (!value || typeof value !== 'object') throw new WorkerError('Invalid worker reply');
    const body = value as { id?: unknown; ok?: unknown; payload?: unknown; error?: unknown };
    if (typeof body.id !== 'string' || typeof body.ok !== 'boolean') {
      throw new WorkerError('Invalid worker reply');
    }
    if (body.ok) {
      if (!('payload' in body)) throw new WorkerError('Invalid worker reply');
      return WorkerReply.ok(body.id, body.payload);
    }
    return WorkerReply.fail(body.id, WorkerError.fromJson(body.error));
  }

  toJson():
    | { id: string; ok: true; payload: unknown }
    | { id: string; ok: false; error: { name: string; message: string } } {
    if (this.error) return { id: this.id, ok: false, error: this.error.toJson() };
    return { id: this.id, ok: true, payload: this.payload };
  }

  unwrap(): unknown {
    if (this.error) throw this.error;
    return this.payload;
  }
}
