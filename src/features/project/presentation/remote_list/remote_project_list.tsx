import '../../project';
import { ProjectStore } from '../../domain/enum/project_store';
import { ProjectListPage } from '../project_list/project_list_page';

export default function RemoteProjectList() {
  return <ProjectListPage title="云端项目" store={ProjectStore.REMOTE} />;
}
