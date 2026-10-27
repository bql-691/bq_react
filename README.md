# bq_react

React 应用脚手架。创建新项目时，包名、源码和 `src` 下文件名里的 `bq` 前缀会换成你传入的项目名。

例如项目名是 `shop`：

- `bq_react` 变成 `shop_react`
- `bq-theme` 变成 `shop-theme`
- 主题变量 `bq` 变成 `shop`

## 创建项目

需要 Node.js，以及已登录的 GitHub CLI（`gh auth login`）。

```bash
curl -fsSL https://raw.githubusercontent.com/bqbqbqbqbq-l/bq_react/v0.1.0/scripts/create.sh | bash -s -- shop
```

这会在当前目录生成 `shop`，并执行 `npm install`。

## 开发这个模板

```bash
npm install
npm run dev
```
