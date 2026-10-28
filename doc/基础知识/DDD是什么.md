# DDD是什么

这里的 DDD 指领域规则写在领域对象上，再用分层规定代码放在哪一层。本仓库用它来规定功能模块的写法。

## 目录

- [四层](#四层)
- [聚合](#聚合)
- [端口](#端口)
- [本仓库里怎么落](#本仓库里怎么落)

## 四层

一个功能模块在 `src/features/<name>/` 下按层分目录。

| 层             | 放什么                                                 | 不放什么                           |
| -------------- | ------------------------------------------------------ | ---------------------------------- |
| `domain`       | 聚合根、值对象、领域方法、端口                         | React、`src/app`、本地或远程的说法 |
| `application`  | 用例。一次业务动作，例如登录、按 `store` 保存项目      | 页面状态、axios、IndexedDB         |
| `infra`        | 端口的实现。访问网络或本地库，并把接口数据收成领域对象 | 页面和 ViewModel                   |
| `presentation` | 页面和 ViewModel                                       | 领域规则，例如笔画长短、撤销栈     |

没有内容的层不建空目录。首页只有 `presentation`，因为它不持有自己的用例，列表和新建都调用 `ProjectApplication`。

用例是模块的业务。`SecurityApplication.login` 负责登录，并把 `LoginResult` 里的访问凭证写入会话。ViewModel 是页面的业务，只保存当前页的表单、错误和加载状态，再调用用例。

## 聚合

`Project` 是项目聚合的根。文件：`src/features/project/domain/entities/project.ts`。外部通过它的方法改文档：

| 方法                   | 作用                                                                |
| ---------------------- | ------------------------------------------------------------------- |
| `Project.create(name)` | 新建一个项目                                                        |
| `addShape(shape)`      | 位移小于 2 时拒绝；接受后把当前 `Document` 快照记进聚合，再加入图形 |
| `undo()` / `redo()`    | 在聚合内部的 `past`、`future` 之间恢复 `Document`                   |
| `touch()`              | 更新 `updatedAt`。保存前由用例调用                                  |

`Document.addShape` 只由 `Project` 调用。`past` 和 `future` 是聚合上的普通字段，不是 `tProp`，所以 `getSnapshot(project)` 不会把撤销栈写进本地库或接口。

安全模块的领域对象是 `AuthCredentials`、`RegisterCredentials`、`User` 和 `LoginResult`。用户名不少于 3 个字符，密码不少于 6 个字符，注册时两次密码相同。`User.hasPermission` 判断角色。`LoginResult` 持有 `User` 和 `accessToken`。

`AUTH_CHANGED` 由 `src/app/session` 在凭证写入或清除后通知界面。它属于会话，不属于领域对象。

## 端口

`domain` 里的端口是抽象类。方法名只表达业务，不写 `local` 或 `remote`。

`ISecurityRepository.login` 返回 `LoginResult`，`register` 接收 `RegisterCredentials`。`SecurityRepository` 用 `Http` 访问接口，再把响应收成 `User` 和 `LoginResult`。

`IProjectRepository` 声明 `list`、`get`、`save`。`LocalProjectRepository` 和 `RemoteProjectRepository` 都实现这一个端口。存在哪一侧由领域枚举 `ProjectStore` 决定，`Project` 上没有这个字段。

## 本仓库里怎么落

登录：

```text
presentation/security_view_model.ts   校验表单，调用 login
application/security_application.ts   调用端口，把 accessToken 交给 TokenStore
domain/i_security_repository.ts       声明 login，返回 LoginResult
infra/security_repository.ts          用 Http 访问 /auth/login，收成 LoginResult
```

绘制：

```text
presentation/editor_view_model.ts     记录草稿，调用 Project.addShape
domain/entities/project.ts            判定笔画，维护撤销栈
application/project_application.ts    按 store 调用 save
infra/..._project_repository.ts       把项目快照写入 IndexedDB 或 Http
```

`TokenStore`、`Http`、`Database` 属于 `src/app`，是全库能力，不是功能模块的领域规则。
