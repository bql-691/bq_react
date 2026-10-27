#!/usr/bin/env bash
# 从公开 GitHub 仓库创建项目，并把源码中的 bq 前缀换成项目名。
# 用法:
#   curl -fsSL https://raw.githubusercontent.com/bql-691/bq_react/v0.1.0/scripts/create.sh | bash -s -- shop
set -euo pipefail

OWNER="bql-691"
REPO="bq_react"
REF="${BQ_REF:-v0.1.0}"
NAME="${1:-}"

if [[ ! "$NAME" =~ ^[a-z][a-z0-9-]*$ ]]; then
  echo "用法: curl -fsSL https://raw.githubusercontent.com/${OWNER}/${REPO}/${REF}/scripts/create.sh | bash -s -- <项目名>" >&2
  echo "项目名需为小写字母开头，只含小写字母、数字和连字符" >&2
  exit 1
fi

if [[ -e "$NAME" ]]; then
  echo "目录已存在: $NAME" >&2
  exit 1
fi

command -v gh >/dev/null 2>&1 || {
  echo "需要 GitHub CLI。安装后执行: gh auth login" >&2
  exit 1
}
command -v node >/dev/null 2>&1 || {
  echo "需要 Node.js" >&2
  exit 1
}
gh auth status >/dev/null 2>&1 || {
  echo "请先登录 GitHub CLI: gh auth login" >&2
  exit 1
}

TMP="$(mktemp -d)"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT

ARCHIVE="$TMP/src.tar.gz"
if ! gh api "repos/${OWNER}/${REPO}/tarball/${REF}" >"$ARCHIVE"; then
  echo "下载失败。请确认 ${OWNER}/${REPO} 上存在引用 ${REF}。" >&2
  exit 1
fi
if ! tar -tzf "$ARCHIVE" >/dev/null 2>&1; then
  echo "下载到的不是源码包。GitHub 返回：" >&2
  head -c 500 "$ARCHIVE" >&2 || true
  echo >&2
  exit 1
fi

mkdir -p "$TMP/src"
tar -xzf "$ARCHIVE" -C "$TMP/src"
shopt -s nullglob
entries=("$TMP/src"/*)
if [[ ${#entries[@]} -ne 1 || ! -d "${entries[0]}" ]]; then
  echo "压缩包结构异常" >&2
  exit 1
fi

mv "${entries[0]}" "$NAME"
node "$NAME/scripts/apply-name.mjs" "$NAME" "$NAME"
rm -rf "$NAME/scripts"
git init -b main "$NAME" >/dev/null
(cd "$NAME" && npm install)

echo "项目已创建: $NAME"
echo "bq 前缀已替换为 ${NAME}，例如包名 ${NAME}_react"
echo "下一步: cd $NAME && npm run dev"
