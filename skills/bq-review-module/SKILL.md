---
name: bq-review-module
description: 按功能模块文档、允许改动表和代码硬约束审核一次改动。在用户要求审核、复查或检查 AI 实现是否符合文档时使用。
---

# 审核一次改动

阅读用户写出路径的文档、`rules/bq-doc-driven.md`、`rules/bq-code-standards.md` 和 `git diff`。先写结论，再写必须修改的项。

```text
## 结论

可合入

## 必须修改

- 文件：src/features/editor/presentation/editor/editor.tsx
  违反：允许改动表
  依据：doc/项目文档/功能模块/编辑器模块/绘制.md
```

结论只有「可合入」或「不可合入」。没有必须修改的项时，删去该节。

## 清单

- 时序图上的方法在代码中没有同名实现，或用户能看见的界面行为在用户请求里写出路径的文档和模块主文档中都没有原文。
- 同一次 diff 修改了另一个 `src/features/<目录>` 或另一篇正式文档，且用户的「允许跨模块」回复里没有写出该路径。
- `git diff` 中有路径不在 `rules/bq-doc-driven.md` 的允许表里，或实现一篇功能模块业务文档时修改了 `auth.layout.tsx` 或 `guest.layout.tsx`。
- 分层、注入 scope、`@bindAs`、路由布局、文案的 `zh_cn.ts` / `en_us.ts` 或 import 路径与 `rules/bq-code-standards.md` 不一致。
- 聚合根以外的代码直接修改聚合根内部的实体。
- 没有在浏览器中按本次业务文档的时序完成一次操作。

`doc/项目文档/代码撰写规范.md` 和本次文档都没有要求的空行、注释用词，不列为必须修改。文档原文与代码不一致时，列出原文和代码，询问「是否更新文档？」。用户回复「更新文档」之前，不改 `doc/`，也不改 `src/`。
