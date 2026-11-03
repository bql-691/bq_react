import { useEffect } from 'react';
import { Outlet, Scripts, ScrollRestoration } from 'react-router';
import { i18n } from './i18n/i18n';
import { applyTheme } from './theme/theme';
import './index.scss';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={i18n.language}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{i18n.t('common.app_name')}</title>
        <link rel="icon" href="/favicon.svg" />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  useEffect(() => {
    applyTheme();
  }, []);

  return <Outlet />;
}
