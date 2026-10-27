import '@/features/project/project';

import { Link, useNavigate } from 'react-router';
import { observer } from 'mobx-react-lite';
import { Avatar, Button } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuthenticated } from '@/app/session/use_authenticated';
import { useViewModel } from '@/app/lifecycle/use_view_model';
import { ProjectStore } from '@/features/project/domain/enum/project_store';
import type { Project } from '@/features/project/domain/entities/project';
import { HomeViewModel } from './home_view_model';
import './home.scss';

function ProjectSection({
  title,
  store,
  projects,
  to,
}: {
  title: string;
  store: ProjectStore;
  projects: Project[];
  to: string;
}) {
  const visible = projects.slice(0, 5);

  return (
    <section className="home-projects">
      <div className="home-projects-head">
        <h2>{title}</h2>
        <Link to={to}>
          <Button type="link">查看全部</Button>
        </Link>
      </div>
      <div className="home-projects-content">
        {visible.length === 0 ? (
          <p>还没有项目</p>
        ) : (
          <ul className="home-projects-list">
            {visible.map((project) => (
              <li key={project.id} onClick={() => {
                window.location.href = `/editor/${project.id}?store=${store}`;
              }}>
                {project.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default observer(function HomePage() {
  const authenticated = useAuthenticated();
  const navigate = useNavigate();
  const vm = useViewModel(HomeViewModel);

  return (
    <div className="home-page">
      <header className="home-header">
        <span className="home-brand">BQ React</span>
        <div className="home-account">
          {authenticated ? (
            <Link to="/profile" aria-label="account">
              <Avatar icon={<UserOutlined />} />
            </Link>
          ) : (
            <Link to="/security">Login</Link>
          )}
        </div>
      </header>
      <main className="home-main">
        <div className="home-editor">
          <Button
            type="primary"
            onClick={() => {
              void vm.createLocal().then((project) => {
                navigate(`/editor/${project.id}?store=${ProjectStore.LOCAL}`);
              });
            }}
          >
            Editor
          </Button>
        </div>
        {vm.errorMessage && <p>{vm.errorMessage}</p>}
        <ProjectSection
          title="云端项目"
          store={ProjectStore.REMOTE}
          projects={vm.cloudProjects}
          to="/projects/remote"
        />
        <ProjectSection
          title="本地项目"
          store={ProjectStore.LOCAL}
          projects={vm.localProjects}
          to="/projects/local"
        />
      </main>
    </div>
  );
});
