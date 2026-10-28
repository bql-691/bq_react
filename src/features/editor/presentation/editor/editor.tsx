import '@/features/project/project';

import { useEffect, type PointerEvent } from 'react';
import { observer } from 'mobx-react-lite';
import { useParams, useSearchParams } from 'react-router';
import { Button } from 'antd';
import { useViewModel } from '@/app/lifecycle/use_view_model';
import { LineShape, RectShape } from '@/features/project/domain/entities/document';
import { DraftShape } from '../../domain/entities/draft_shape';
import { EditorTool } from '../../domain/enum/editor_tool';
import { EditorViewModel } from './editor_view_model';
import './editor.scss';

export default observer(function EditorPage() {
  const vm = useViewModel(EditorViewModel);
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const store = searchParams.get('store');

  useEffect(() => {
    void vm.open(projectId ?? '', store);
  }, [vm, projectId, store]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'z') return;
      event.preventDefault();
      if (event.shiftKey) vm.redo();
      else vm.undo();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [vm]);

  return (
    <main className="editor-page">
      <div className="editor-toolbar">
        <Button type="link" onClick={() => (window.location.href = '/')}>
          Home
        </Button>
        <span>{vm.project?.name ?? 'Editor'}</span>
        <Button
          type={vm.tool === EditorTool.LINE ? 'primary' : 'default'}
          onClick={() => vm.setTool(EditorTool.LINE)}
        >
          直线
        </Button>
        <Button
          type={vm.tool === EditorTool.RECT ? 'primary' : 'default'}
          onClick={() => vm.setTool(EditorTool.RECT)}
        >
          矩形
        </Button>
        <Button onClick={() => vm.undo()} disabled={!vm.canUndo}>
          撤销
        </Button>
        <Button onClick={() => vm.redo()} disabled={!vm.canRedo}>
          重做
        </Button>
      </div>
      {vm.errorMessage && <p>{vm.errorMessage}</p>}
      <svg
        className="editor-canvas"
        viewBox="0 0 960 480"
        onPointerDown={(event) => {
          const point = svgPoint(event);
          event.currentTarget.setPointerCapture(event.pointerId);
          vm.pointerDown(point.x, point.y);
        }}
        onPointerMove={(event) => {
          if (!vm.draft) return;
          const point = svgPoint(event);
          vm.pointerMove(point.x, point.y);
        }}
        onPointerUp={() => vm.pointerUp()}
      >
        {vm.project?.document.shapes.map((shape) =>
          shape instanceof LineShape ? (
            <line key={shape.id} x1={shape.x1} y1={shape.y1} x2={shape.x2} y2={shape.y2} />
          ) : shape instanceof RectShape ? (
            <rect
              key={shape.id}
              x={shape.x}
              y={shape.y}
              width={shape.width}
              height={shape.height}
            />
          ) : null,
        )}
        {vm.draft && <Draft draft={vm.draft} />}
      </svg>
    </main>
  );
});

function Draft({ draft }: { draft: DraftShape }) {
  if (draft.kind === EditorTool.LINE) {
    return <line x1={draft.x1} y1={draft.y1} x2={draft.x2} y2={draft.y2} />;
  }
  const bounds = draft.rect();
  return <rect x={bounds.x} y={bounds.y} width={bounds.width} height={bounds.height} />;
}

function svgPoint(event: PointerEvent<SVGSVGElement>) {
  const svg = event.currentTarget;
  const matrix = svg.getScreenCTM();
  if (!matrix) return { x: 0, y: 0 };
  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  const local = point.matrixTransform(matrix.inverse());
  return { x: local.x, y: local.y };
}
