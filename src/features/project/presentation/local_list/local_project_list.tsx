import '../../project';
import { useTranslation } from 'react-i18next';
import { ProjectStore } from '../../domain/enum/project_store';
import { ProjectListPage } from '../project_list/project_list_page';

export default function LocalProjectList() {
  const { t } = useTranslation();
  return <ProjectListPage title={t('project.local')} store={ProjectStore.LOCAL} />;
}
