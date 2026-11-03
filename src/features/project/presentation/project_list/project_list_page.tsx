import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { useViewModel } from '@app';
import type { ProjectStore } from '../../domain/enum/project_store';
import { ProjectRow } from '../project_row/project_row';
import { ProjectListViewModel } from './project_list_view_model';
import './project_list.scss';

export const ProjectListPage = observer(function ProjectListPage({
  title,
  store,
}: {
  title: string;
  store: ProjectStore;
}) {
  const vm = useViewModel(ProjectListViewModel);
  const { t } = useTranslation();

  useEffect(() => {
    void vm.load(store);
  }, [vm, store]);

  return (
    <main className="project-list-page">
      <h1>{title}</h1>
      {vm.errorMessage && <p>{vm.errorMessage}</p>}
      {vm.projects.length === 0 ? (
        <p>{t('common.empty')}</p>
      ) : (
        <ul className="project-list">
          {vm.projects.map((project) => (
            <ProjectRow key={project.id} project={project} store={store} />
          ))}
        </ul>
      )}
    </main>
  );
});
