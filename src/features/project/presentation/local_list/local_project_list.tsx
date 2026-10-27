import '../../project';
import { ProjectStore } from '../../domain/enum/project_store';
import { ProjectListPage } from '../project_list/project_list_page';

export default function LocalProjectList() {
  return <ProjectListPage title="本地项目" store={ProjectStore.LOCAL} />;
}
