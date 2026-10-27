import { EditorTool } from '../enum/editor_tool';

export class DraftShape {
  readonly kind: EditorTool;
  readonly x1: number;
  readonly y1: number;
  x2: number;
  y2: number;

  constructor(kind: EditorTool, x: number, y: number) {
    this.kind = kind;
    this.x1 = x;
    this.y1 = y;
    this.x2 = x;
    this.y2 = y;
  }

  move(x: number, y: number) {
    this.x2 = x;
    this.y2 = y;
  }

  rect(): { x: number; y: number; width: number; height: number } {
    return {
      x: Math.min(this.x1, this.x2),
      y: Math.min(this.y1, this.y2),
      width: Math.abs(this.x2 - this.x1),
      height: Math.abs(this.y2 - this.y1),
    };
  }
}
