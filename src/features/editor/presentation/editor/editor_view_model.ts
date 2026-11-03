import { injectable } from 'inversify';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { i18n, PageViewModel } from '@app';
import { ProjectApplication } from '@/features/project/application/project_application';
import { ProjectStore } from '@/features/project/domain/enum/project_store';
import { LineShape, RectShape } from '@/features/project/domain/entities/document';
import type { Project } from '@/features/project/domain/entities/project';
import { DraftShape } from '../../domain/entities/draft_shape';
import { EditorTool } from '../../domain/enum/editor_tool';

@injectable('Transient')
export class EditorViewModel extends PageViewModel {
  project: Project | null = null;
  store: ProjectStore | null = null;
  tool: EditorTool = EditorTool.LINE;
  draft: DraftShape | null = null;
  errorMessage = '';

  constructor(private application: ProjectApplication) {
    super();
    makeObservable(this, {
      project: observable,
      store: observable,
      tool: observable,
      draft: observable,
      errorMessage: observable,
      canUndo: computed,
      canRedo: computed,
      setTool: action,
      pointerDown: action,
      pointerMove: action,
      pointerUp: action,
      undo: action,
      redo: action,
    });
  }

  get canUndo(): boolean {
    return this.project?.canUndo ?? false;
  }

  get canRedo(): boolean {
    return this.project?.canRedo ?? false;
  }

  async open(id: string, store: string | null): Promise<void> {
    if (!id || !store) {
      runInAction(() => {
        this.errorMessage = i18n.t('editor.missing');
      });
      return;
    }
    const current = Object.values(ProjectStore).find((item) => item === store);
    if (!current) {
      runInAction(() => {
        this.errorMessage = i18n.t('editor.invalid_store');
      });
      return;
    }

    try {
      const project = await this.application.get(current, id);
      runInAction(() => {
        this.project = project;
        this.store = current;
        this.draft = null;
        this.errorMessage = project ? '' : i18n.t('editor.not_found');
      });
    } catch (error) {
      runInAction(() => {
        this.errorMessage = error instanceof Error ? error.message : i18n.t('common.load_failed');
      });
    }
  }

  setTool(tool: EditorTool) {
    this.tool = tool;
  }

  pointerDown(x: number, y: number) {
    if (!this.project) return;
    this.draft = new DraftShape(this.tool, x, y);
  }

  pointerMove(x: number, y: number) {
    if (!this.draft) return;
    this.draft.move(x, y);
  }

  pointerUp() {
    const draft = this.draft;
    this.draft = null;
    if (!draft || !this.project) return;

    const bounds = draft.rect();
    const shape =
      draft.kind === EditorTool.LINE
        ? new LineShape({
            id: crypto.randomUUID(),
            x1: draft.x1,
            y1: draft.y1,
            x2: draft.x2,
            y2: draft.y2,
          })
        : new RectShape({
            id: crypto.randomUUID(),
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
          });

    if (!this.project.addShape(shape)) return;
    void this.persist();
  }

  undo() {
    if (!this.project?.undo()) return;
    void this.persist();
  }

  redo() {
    if (!this.project?.redo()) return;
    void this.persist();
  }

  private async persist() {
    if (!this.project || !this.store) return;
    try {
      await this.application.save(this.store, this.project);
      runInAction(() => {
        this.errorMessage = '';
      });
    } catch (error) {
      runInAction(() => {
        this.errorMessage = error instanceof Error ? error.message : i18n.t('common.save_failed');
      });
    }
  }
}
