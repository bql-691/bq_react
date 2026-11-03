import { makeObservable, observable } from 'mobx';
import {
  applySnapshot,
  fromSnapshot,
  getSnapshot,
  Model,
  model,
  modelAction,
  tProp,
  types,
} from 'mobx-keystone';
import { Document, LineShape, type Shape } from './document';

const MIN_STROKE = 2;

@model('project/Project')
export class Project extends Model({
  type: tProp(types.literal('project/Project'), 'project/Project'),
  id: tProp(types.string),
  name: tProp(types.string),
  updatedAt: tProp(types.number),
  document: tProp(types.model(Document), () => new Document({})),
}) {
  past: object[] = [];
  future: object[] = [];

  static create(name: string): Project {
    return new Project({
      id: crypto.randomUUID(),
      name,
      updatedAt: Date.now(),
      document: new Document({}),
    });
  }

  static fromData(data: unknown): Project {
    return fromSnapshot(Project, withModelType(data) as never);
  }

  protected onInit(): void {
    makeObservable(this, {
      past: observable,
      future: observable,
    });
  }

  @modelAction
  touch() {
    this.updatedAt = Date.now();
  }

  get canUndo(): boolean {
    return this.past.length > 0;
  }

  get canRedo(): boolean {
    return this.future.length > 0;
  }

  @modelAction
  addShape(shape: Shape): boolean {
    if (strokeTooSmall(shape)) return false;
    this.past.push(getSnapshot(this.document));
    this.future = [];
    this.document.addShape(shape);
    return true;
  }

  @modelAction
  undo(): boolean {
    const previous = this.past.pop();
    if (!previous) return false;
    this.future.push(getSnapshot(this.document));
    applySnapshot(this.document, previous as never);
    return true;
  }

  @modelAction
  redo(): boolean {
    const next = this.future.pop();
    if (!next) return false;
    this.past.push(getSnapshot(this.document));
    applySnapshot(this.document, next as never);
    return true;
  }
}

/** 报文 type 到 @model 名称。两边的字符串可以不同。 */
const modelByType: Record<string, string> = {
  'project/Project': 'project/Project',
  'project/Document': 'project/Document',
  'project/LineShape': 'project/LineShape',
  'project/RectShape': 'project/RectShape',
};

function withModelType(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(withModelType);
  if (!value || typeof value !== 'object') return value;
  const result: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (key.startsWith('$')) continue;
    result[key] = withModelType(item);
  }
  if (typeof result.type === 'string') {
    const modelType = modelByType[result.type];
    if (modelType) result.$modelType = modelType;
  }
  return result;
}

function strokeTooSmall(shape: Shape): boolean {
  if (shape instanceof LineShape) {
    return Math.hypot(shape.x2 - shape.x1, shape.y2 - shape.y1) < MIN_STROKE;
  }
  return Math.hypot(shape.width, shape.height) < MIN_STROKE;
}
