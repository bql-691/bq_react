# mobx是什么

MobX 负责页面上会变化的状态。mobx-keystone 负责可以保存、比较和恢复的实体。页面组件只负责渲染，不存放业务状态。

## 目录

- [页面状态](#页面状态)
- [ViewModel 的生命周期](#viewmodel-的生命周期)
- [实体与快照](#实体与快照)

## 页面状态

ViewModel 里需要触发重渲染的字段标成 `observable`，修改这些字段的方法标成 `action`。组件用 `mobx-react-lite` 的 `observer` 包起来，字段变化后才会重画。

`SecurityViewModel` 的 `errorMessage`、`isLoading` 就是页面状态。它们跟着这一次打开的登录页，所以这个类标 `@injectable('Transient')`。

普通字段不用 observable。不会显示在界面上的局部变量也不放进 ViewModel。

## ViewModel 的生命周期

ViewModel 继承 `PageViewModel`。页面不自己 `new`，而调用 `useViewModel`。

```ts
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
```

`created` 在实例取出时调用。`ready` 在页面挂上后调用，适合开始加载数据，例如 `HomeViewModel.ready` 去拉项目列表。`beforeRefresh` 在页面被浏览器收起时调用。离开页面时调用 `dispose`。

## 实体与快照

`Project`、`Document`、`LineShape` 使用 mobx-keystone 的 `@model`。要保存的字段用 `tProp` 声明，修改实体的方法标 `@modelAction`。对外改文档的方法在聚合根上：`Project.addShape`、`Project.undo`、`Project.redo`、`Project.touch`。

快照是实体在某一刻的普通对象。`getSnapshot` 取出它，`applySnapshot` 把实体恢复成那一份。`Project.addShape` 接受图形前，把 `Document` 的快照放进聚合自己的 `past`，`undo` 和 `redo` 再用 `applySnapshot` 换回来。`past` 和 `future` 在 `onInit` 里标成 `observable`，页面才能根据 `canUndo`、`canRedo` 重绘。它们不是 `tProp`，`getSnapshot(project)` 不包含撤销栈。

保存到本地库或提交给接口之前，仓储取出项目快照再写入。实体类仍然留在内存里给界面使用。编辑器 ViewModel 只持有当前的 `project`、`store`、工具和草稿。
