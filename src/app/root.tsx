import { useEffect } from 'react';
import { Outlet, Scripts, ScrollRestoration } from 'react-router';
import { applyTheme } from './theme/theme';
import './index.scss';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>bq_react</title>
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
