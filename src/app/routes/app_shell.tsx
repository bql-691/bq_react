import { App, ConfigProvider } from 'antd';
import { I18nextProvider } from 'react-i18next';
import { Outlet } from 'react-router';
import { i18n } from '@/app/i18n/i18n';
import { antdTheme } from '@/app/theme/antd_theme';
import { useResolvedTheme } from '@/app/theme/use_theme';

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
