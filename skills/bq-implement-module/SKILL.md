---
name: bq-implement-module
description: 按用户请求里写出路径的功能模块业务文档实现，且只实现这一篇。在用户给出 doc/项目文档/功能模块 下的文档路径，或要求按文档实现某个功能模块时使用。
---

# 实现一条业务

1. 按 `skills/bq-accept-doc/SKILL.md` 检查文档。当前对话里还没有「文档没有问题」和「业务正常」，或检查结果列出缺口时，停止，不写代码。用户描述与文档原文不同时，询问「是否更新文档？」，不改 `src/`。
2. 阅读 `rules/bq-doc-driven.md`、`rules/bq-code-standards.md`、`doc/项目文档/项目架构.md`、`doc/项目文档/代码撰写规范.md`，以及该模块主文档和用户写出路径的业务文档。
3. 只实现用户写出路径的那一篇业务文档。还要修改另一个 `src/features/<目录>` 或另一篇正式文档时，先按 `rules/bq-doc-driven.md` 的「跨模块」询问。用户回复「允许跨模块」并写出路径之后，才修改这些路径。
4. `git diff` 中的每个路径都要出现在 `rules/bq-doc-driven.md` 的允许表中，或出现在「允许跨模块」回复写出的路径中。出现「必须停下来」中的任一情况时，列出缺的原文或要改的路径，然后停止。
5. 层目录、文件名、注入、模块入口、页面默认导出，以及文档已经写明路径的路由登记，按 `rules/bq-code-standards.md` 实现。
6. 用 `skills/bq-review-module/SKILL.md` 的清单自检。在浏览器中按本次业务文档的时序完成一次操作。
7. 不提交，除非用户接着要求提交。提交时改用 `skills/bq-commit-change/SKILL.md`。

基础应用迭代同样先执行 `skills/bq-accept-doc/SKILL.md`，然后只改该文件名括号中的 `src/app/<目录>/**`。

```text
文档没有问题，业务正常。
按 doc/项目文档/功能模块/编辑器模块/绘制.md 实现这一条业务。
只改 editor。
```
