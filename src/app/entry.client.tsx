import 'reflect-metadata'; // 反射元数据
import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';
import { rootContainer } from './di/root_container';
import { I18n } from './i18n/i18n';

rootContainer.get(I18n);

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>,
  );
});
