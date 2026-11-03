import { App, ConfigProvider } from 'antd';
import { I18nextProvider } from 'react-i18next';
import { Outlet } from 'react-router';
import { i18n } from '../i18n/i18n';
import { antdTheme } from '../theme/antd_theme';
import { useResolvedTheme } from '../theme/use_theme';

export default function AppShell() {
  const resolved = useResolvedTheme();

  return (
    <I18nextProvider i18n={i18n}>
      <ConfigProvider theme={antdTheme(resolved)}>
        <App>
          <Outlet />
        </App>
      </ConfigProvider>
    </I18nextProvider>
  );
}
