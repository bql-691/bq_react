import { WorkerError } from './worker_error';

export class WorkerMessage {
  readonly id: string;
  readonly type: string;
  readonly payload: unknown;

  constructor(type: string, payload: unknown, id: string = crypto.randomUUID()) {
    this.id = id;
    this.type = type;
    this.payload = payload;
  }

  static fromJson(value: unknown): WorkerMessage {
    if (!value || typeof value !== 'object') throw new WorkerError('Invalid worker message');
    const body = value as { id?: unknown; type?: unknown; payload?: unknown };
    if (typeof body.id !== 'string' || typeof body.type !== 'string' || !('payload' in body)) {
      throw new WorkerError('Invalid worker message');
    }
    return new WorkerMessage(body.type, body.payload, body.id);
  }

  toJson(): { id: string; type: string; payload: unknown } {
    return { id: this.id, type: this.type, payload: this.payload };
  }
}
