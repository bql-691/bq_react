import { Model, model, modelAction, tProp, types } from 'mobx-keystone';

@model('project/LineShape')
export class LineShape extends Model({
  type: tProp(types.literal('project/LineShape'), 'project/LineShape'),
  id: tProp(types.string),
  x1: tProp(types.number),
  y1: tProp(types.number),
  x2: tProp(types.number),
  y2: tProp(types.number),
}) {}

@model('project/RectShape')
export class RectShape extends Model({
  type: tProp(types.literal('project/RectShape'), 'project/RectShape'),
  id: tProp(types.string),
  x: tProp(types.number),
  y: tProp(types.number),
  width: tProp(types.number),
  height: tProp(types.number),
}) {}

export type Shape = LineShape | RectShape;

@model('project/Document')
export class Document extends Model({
  type: tProp(types.literal('project/Document'), 'project/Document'),
  shapes: tProp(types.array(types.or(types.model(LineShape), types.model(RectShape))), () => []),
}) {
  @modelAction
  addShape(shape: Shape) {
    this.shapes.push(shape);
  }
}
