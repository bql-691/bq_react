---
name: bq-commit-change
description: 按仓库提交说明创建 git commit。文档用 docs，确认后的代码用 feat 或 fix，两段分开提交。仅在用户明确要求提交时使用。
---

# 提交本次改动

1. 阅读 `rules/bq-git-commit.md` 和 `rules/bq-doc-driven.md` 的允许表。
2. 并行查看 `git status`、`git diff` 和近期 `git log`。
3. `doc/项目文档/` 与 `src/` 同时有改动时，分成两次提交：先 `docs`，后 `feat` 或 `fix`。当前对话里还没有「文档没有问题」和「业务正常」时，只创建 `docs`，不创建 `feat` 或 `fix`。
4. `docs` 一次只暂存一篇正式文档。`feat`、`fix`、`refactor` 一次只暂存一个功能模块目录，或一个 `src/app/<目录>`，并且不暂存 `doc/`。用户已回复「允许跨模块」并写出多个路径时，按每个功能模块目录、每个 `src/app/<目录>`、每篇正式文档各做一个提交。范围以外的改动保持未暂存，并在提交前写出这些路径。
5. 用 HEREDOC 传入提交说明。`docs`、`feat`、`fix` 的 `Doc:` 只有一行。
6. 提交后运行 `git status` 确认结果。钩子失败时修问题并新建一次提交。

不提交 `.env`、密钥和生成产物。不使用 `--no-verify`。用户没有明确要求时不执行 `git commit`，也不推送远程。
