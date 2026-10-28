# bq_react

React 应用脚手架。创建新项目时，包名、源码和 `src` 下文件名里的 `bq` 前缀会换成你传入的项目名。

例如项目名是 `shop`：

- `bq_react` 变成 `shop_react`
- `bq_theme` 变成 `shop_theme`
- 主题变量 `bq` 变成 `shop`

## 创建项目

项目名是目标目录的最后一段，需为小写字母开头，只含小写字母、数字和连字符。两种模式都会执行 `npm install`，并用项目名替换 `bq` 前缀。

### 远程

从公开的 GitHub 标签下载模板。需要 Node.js 和 curl。

```bash
curl -fsSL https://raw.githubusercontent.com/bql-691/bq_react/v0.1.1/scripts/create.sh | bash -s -- shop
```

这会在当前目录生成 `shop`。

### 本地

先克隆模板仓库，再在指定目录生成项目。本地模式不会下载，也不会改动模板仓库本身。需要 Node.js。

```bash
git clone https://github.com/bql-691/bq_react.git
cd bq_react
bash scripts/create.sh local /path/to/shop
```

`/path/to/shop` 的项目名是 `shop`。目标目录不能已经存在，也不能放在模板仓库里面。

## 开发这个模板

```bash
npm install
npm run dev
```
