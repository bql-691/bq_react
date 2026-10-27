# DI是什么

依赖注入是指类不自己 `new` 依赖，而是由容器按构造函数的参数创建并传入。本仓库的容器是 Inversify 的 `rootContainer`。端口是依赖倒置里的抽象，分层见 [DDD是什么](./DDD是什么.md)。

## 目录

- [原则和做法](#原则和做法)
- [容器](#容器)
- [Singleton 与 Transient](#singleton-与-transient)
- [端口怎么绑到实现](#端口怎么绑到实现)
- [同一个端口的多个实现](#同一个端口的多个实现)
- [装饰器能生效的条件](#装饰器能生效的条件)

## 原则和做法

依赖倒置、依赖注入、控制反转是同一条链上的三件事。

依赖倒置：用例和仓储实现都只对着端口。`SecurityApplication` 调用 `ISecurityRepository.login`，不引用 `Http`。`SecurityRepository` 负责请求。登录成功后，用例把 `accessToken` 写入会话。

依赖注入：仓储和 `TokenStore` 从构造函数进来。`SecurityApplication` 只声明参数类型。

控制反转：创建哪一个实现、创建几次，由 `rootContainer` 决定。页面用 `useViewModel` 取出 ViewModel，容器顺着构造函数继续创建用例和仓储。

## 容器

`src/app/di/root_container.ts` 创建唯一容器。`autobind` 打开后，标了 `@injectable` 的具体类可以按类本身取出。`defaultScope` 是 `Singleton`。

页面通过 `useViewModel(SecurityViewModel)` 取出 ViewModel。`useViewModel` 内部调用 `rootContainer.get`。ViewModel 的构造函数需要 `SecurityApplication` 时，容器继续创建或取出用例，再把仓储注入用例。

## Singleton 与 Transient

`Singleton` 在整个应用里只有一个实例。用例、仓储、`TokenStore`、`Http`、`Database` 使用它，这样凭证和连接可以在页面之间共用。

`Transient` 每次 `get` 都新建一个实例。页面 ViewModel 使用它。`useViewModel` 在页面挂载时取一次，离开页面后不再使用这个实例，表单和草稿不会留到下一次进入。

无参的 `@injectable()` 等于 `Singleton`。新代码要写出 `'Singleton'` 或 `'Transient'`。

## 端口怎么绑到实现

用例依赖的是抽象类 `ISecurityRepository`，容器默认不知道用哪个实现。实现类同时标上：

```ts
@bindAs(ISecurityRepository)
@injectable('Singleton')
export class SecurityRepository implements ISecurityRepository {}
```

`@bindAs` 写在 `@injectable` 上面。类装饰器从靠近类的那一个开始执行，`@injectable` 先记下构造函数参数的类型，`@bindAs` 再把端口绑到这个实现。这个类文件必须被执行到，绑定才会发生。执行方式见 [代码实践](./代码实践.md) 里的模块入口。

只在 `infra` 的端口实现上使用 `@bindAs`。用例和 ViewModel 按类本身注册。

## 同一个端口的多个实现

`IProjectRepository` 有本地和远程两个实现。绑定时带上名称，容器里才会同时留下两份：

```ts
@bindAs(IProjectRepository, ProjectStore.LOCAL)
@injectable('Singleton')
export class LocalProjectRepository implements IProjectRepository {}
```

`RemoteProjectRepository` 使用 `ProjectStore.REMOTE`。两个实现留在同一个端口上，用名称区分。

用例的构造函数依赖抽象端口。两个参数类型都是 `IProjectRepository`，类型元数据区分不了本地和远程，所以用 `@inject` 指定端口，用 `@named` 指定实现：

```ts
constructor(
  @inject(IProjectRepository) @named(ProjectStore.LOCAL) private localRepository: IProjectRepository,
  @inject(IProjectRepository) @named(ProjectStore.REMOTE) private remoteRepository: IProjectRepository,
) {}
```

页面只传入 `ProjectStore`，不自己决定用 IndexedDB 还是 `Http`。

## 装饰器能生效的条件

JavaScript 运行时不保留构造函数参数的类型。`tsconfig.app.json` 打开 `experimentalDecorators` 和 `emitDecoratorMetadata` 后，编译器把参数类型写成 `design:paramtypes`。容器读这个数组，按类型创建依赖。

`SecurityApplication` 的参数类型分别是 `ISecurityRepository` 和 `TokenStore`，数组里就能分开，构造函数只声明类型。`ProjectApplication` 的两个参数类型都是 `IProjectRepository`。上一节用 `@inject` 指定端口，用 `@named(ProjectStore.LOCAL)` 和 `@named(ProjectStore.REMOTE)` 指定实现，容器按名称选择。

跨目录引用写 `@/app/...` 或 `@/features/...`。只表示类型的导入写成 `import type`，避免把类型当成运行时代码。
