import { index, layout, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  layout('routes/app_shell.tsx', [
    index('../features/home/presentation/home/home.tsx'),
    layout('routes/layouts/guest.layout.tsx', [
      route('security', '../features/security/presentation/security/security.tsx'),
    ]),
    layout('routes/layouts/auth.layout.tsx', [
      route('profile', '../features/security/presentation/security/profile.tsx'),
      route('projects/remote', '../features/project/presentation/remote_list/remote_project_list.tsx'),
      route('projects/local', '../features/project/presentation/local_list/local_project_list.tsx'),
      route('editor/:projectId', '../features/editor/presentation/editor/editor.tsx'),
    ]),
    route('*', 'routes/components/catchall.tsx'),
  ]),
] satisfies RouteConfig;
