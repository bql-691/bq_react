import '@/features/home/home';
import '@/features/project/project';

import { Link, useNavigate } from 'react-router';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { Avatar, Button } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuthenticated, useViewModel } from '@app';
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
  const { t } = useTranslation();
  const visible = projects.slice(0, 5);

  return (
    <section className="home-projects">
      <div className="home-projects-head">
        <h2>{title}</h2>
        <Link to={to}>
          <Button type="link">{t('common.view_all')}</Button>
        </Link>
      </div>
      <div className="home-projects-content">
        {visible.length === 0 ? (
          <p>{t('common.empty')}</p>
        ) : (
          <ul className="home-projects-list">
            {visible.map((project) => (
              <li
                key={project.id}
                onClick={() => {
                  window.location.href = `/editor/${project.id}?store=${store}`;
                }}
              >
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
  const { t } = useTranslation();
  const vm = useViewModel(HomeViewModel);

  return (
    <div className="home-page">
      <header className="home-header">
        <span className="home-brand">{t('common.app_name')}</span>
        <div className="home-account">
          {authenticated ? (
            <Link to="/profile" aria-label={t('home.account')}>
              <Avatar icon={<UserOutlined />} />
            </Link>
          ) : (
            <Link to="/security">{t('home.login')}</Link>
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
            {t('home.editor')}
          </Button>
        </div>
        {vm.errorMessage && <p>{vm.errorMessage}</p>}
        <ProjectSection
          title={t('project.remote')}
          store={ProjectStore.REMOTE}
          projects={vm.cloudProjects}
          to="/projects/remote"
        />
        <ProjectSection
          title={t('project.local')}
          store={ProjectStore.LOCAL}
          projects={vm.localProjects}
          to="/projects/local"
        />
      </main>
    </div>
  );
});
