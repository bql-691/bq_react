#!/usr/bin/env bash
# 创建项目，并把源码中的 bq 前缀换成项目名。
# 远程: curl -fsSL https://raw.githubusercontent.com/bql-691/bq_react/v0.1.1/scripts/create.sh | bash -s -- shop
# 本地: bash scripts/create.sh local /path/to/shop
# 可选: --no-doc 不带 doc；--no-rules 不带 rules、skills 及 .cursor 副本
set -euo pipefail

OWNER="bql-691"
REPO="bq_react"
REF="${BQ_REF:-v0.1.1}"
NO_DOC=0
NO_RULES=0

usage() {
  echo "远程: curl -fsSL https://raw.githubusercontent.com/${OWNER}/${REPO}/${REF}/scripts/create.sh | bash -s -- [--no-doc] [--no-rules] <项目名>" >&2
  echo "本地: bash scripts/create.sh local [--no-doc] [--no-rules] <目录>" >&2
  echo "--no-doc    不带 doc 目录及其内部文件" >&2
  echo "--no-rules  不带 rules、skills，以及 .cursor 中的副本" >&2
  echo "项目名需为小写字母开头，只含小写字母、数字和连字符" >&2
}

require_name() {
  if [[ ! "$1" =~ ^[a-z][a-z0-9-]*$ ]]; then
    usage
    exit 1
  fi
}

require_node() {
  command -v node >/dev/null 2>&1 || {
    echo "需要 Node.js" >&2
    exit 1
  }
}

omit_optional() {
  local dest="$1"
  if [[ "$NO_DOC" == 1 ]]; then
    rm -rf "$dest/doc"
    echo "未包含 doc 目录"
  fi
  if [[ "$NO_RULES" == 1 ]]; then
    rm -rf "$dest/rules" "$dest/skills" "$dest/.cursor/rules" "$dest/.cursor/skills"
    rmdir "$dest/.cursor" 2>/dev/null || true
    echo "未包含 rules 与 skills"
  fi
}

finish_project() {
  local name="$1"
  local dest="$2"
  omit_optional "$dest"
  node "$dest/scripts/apply-name.mjs" "$name" "$dest"
  rm -rf "$dest/scripts"
  git init -b main "$dest" >/dev/null
  (cd "$dest" && npm install)
  echo "项目已创建: $dest"
  echo "bq 前缀已替换为 ${name}，例如包名 ${name}_react"
  echo "下一步: cd $dest && npm run dev"
}

create_remote() {
  local name="$1"
  require_name "$name"
  if [[ -e "$name" ]]; then
    echo "目录已存在: $name" >&2
    exit 1
  fi
  command -v curl >/dev/null 2>&1 || {
    echo "需要 curl" >&2
    exit 1
  }
  require_node

  local tmp archive url
  tmp="$(mktemp -d)"
  cleanup() { rm -rf "$tmp"; }
  trap cleanup EXIT

  archive="$tmp/src.tar.gz"
  url="https://github.com/${OWNER}/${REPO}/archive/refs/tags/${REF}.tar.gz"
  if ! curl -fsSL "$url" -o "$archive"; then
    echo "下载失败。请确认 ${OWNER}/${REPO} 上存在标签 ${REF}。" >&2
    exit 1
  fi
  if ! tar -tzf "$archive" >/dev/null 2>&1; then
    echo "下载到的不是源码包。GitHub 返回：" >&2
    head -c 500 "$archive" >&2 || true
    echo >&2
    exit 1
  fi

  mkdir -p "$tmp/src"
  tar -xzf "$archive" -C "$tmp/src"
  shopt -s nullglob
  local entries=("$tmp/src"/*)
  if [[ ${#entries[@]} -ne 1 || ! -d "${entries[0]}" ]]; then
    echo "压缩包结构异常" >&2
    exit 1
  fi

  mv "${entries[0]}" "$name"
  trap - EXIT
  cleanup
  finish_project "$name" "$name"
}

create_local() {
  local dest_arg="${1:-}"
  if [[ -z "$dest_arg" ]]; then
    usage
    exit 1
  fi
  if [[ -z "${BASH_SOURCE[0]:-}" || ! -f "${BASH_SOURCE[0]}" ]]; then
    echo "本地模式需要在已克隆的模板仓库里执行: bash scripts/create.sh local <目录>" >&2
    exit 1
  fi

  local source parent name dest
  source="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
  parent="$(dirname "$dest_arg")"
  if [[ ! -d "$parent" ]]; then
    echo "上级目录不存在: $parent" >&2
    exit 1
  fi
  name="$(basename "$dest_arg")"
  require_name "$name"
  dest="$(cd "$parent" && pwd)/$name"
  if [[ -e "$dest" ]]; then
    echo "目录已存在: $dest" >&2
    exit 1
  fi
  if [[ "$dest" == "$source" || "$dest" == "$source"/* ]]; then
    echo "目标目录不能放在模板仓库里面: $dest" >&2
    exit 1
  fi
  require_node

  mkdir -p "$dest"
  tar -C "$source" \
    --exclude .git \
    --exclude node_modules \
    --exclude .react-router \
    --exclude dist \
    -cf - . | tar -C "$dest" -xf -
  finish_project "$name" "$dest"
}

positionals=()
for arg in "$@"; do
  case "$arg" in
    --no-doc) NO_DOC=1 ;;
    --no-rules) NO_RULES=1 ;;
    --) ;;
    -*)
      echo "未知参数: $arg" >&2
      usage
      exit 1
      ;;
    *) positionals+=("$arg") ;;
  esac
done

if [[ "${positionals[0]:-}" == "local" ]]; then
  if [[ "${#positionals[@]}" -ne 2 ]]; then
    usage
    exit 1
  fi
  create_local "${positionals[1]}"
elif [[ "${#positionals[@]}" -eq 1 ]]; then
  create_remote "${positionals[0]}"
else
  usage
  exit 1
fi
