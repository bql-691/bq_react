import { useEffect, useState } from 'react';
import type { Newable } from 'inversify';
import type { PageViewModel } from './page_view_model';
import { rootContainer } from '../di/root_container';

export function useViewModel<T extends PageViewModel>(identifier: Newable<T>): T {
  const [viewModel] = useState(() => {
    const vm = rootContainer.get(identifier);
    vm.created();
    return vm;
  });

  useEffect(() => {
    viewModel.ready();
    const onPageHide = () => viewModel.beforeRefresh();
    const onFreeze = () => viewModel.beforeSuspend();
    const onResume = () => viewModel.resume();
    window.addEventListener('pagehide', onPageHide);
    document.addEventListener('freeze', onFreeze);
    document.addEventListener('resume', onResume);
    return () => {
      window.removeEventListener('pagehide', onPageHide);
      document.removeEventListener('freeze', onFreeze);
      document.removeEventListener('resume', onResume);
      viewModel.dispose();
    };
  }, [viewModel]);

  return viewModel;
}
