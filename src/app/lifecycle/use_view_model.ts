import { useEffect, useState } from 'react';
import type { PageViewModel } from './page_view_model';
import { rootContainer } from '../di/root_container';

export function useViewModel<T extends PageViewModel>(identifier: new (...args: any[]) => T): T {
  const [viewModel] = useState(() => {
    const vm = rootContainer.get(identifier);
    vm.created();
    return vm;
  });

  useEffect(() => {
    viewModel.ready();
    const onPageHide = () => viewModel.beforeRefresh();
    window.addEventListener('pagehide', onPageHide);
    return () => {
      window.removeEventListener('pagehide', onPageHide);
      viewModel.dispose();
    };
  }, [viewModel]);

  return viewModel;
}
