import { readdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

const projectName = process.argv[2];
const root = path.resolve(process.argv[3] ?? process.cwd());

if (!projectName || !/^[a-z][a-z0-9-]*$/.test(projectName)) {
  console.error('用法: node scripts/apply-name.mjs <项目名> [目录]');
  console.error('项目名需为小写字母开头，只含小写字母、数字和连字符');
  process.exit(1);
}

const skipDirs = new Set(['node_modules', '.git', 'dist', '.react-router', 'scripts', 'doc']);
const textExtensions = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.mjs',
  '.cjs',
  '.scss',
  '.css',
  '.json',
  '.html',
  '.svg',
]);

function replaceBqPrefix(text) {
  return text.replace(/(^|[^A-Za-z0-9])bq/g, `$1${projectName}`);
}

async function rewriteFile(file) {
  const text = await readFile(file, 'utf8');
  const next =
    path.basename(file) === 'package-lock.json'
      ? text.replaceAll('"name": "bq_react"', `"name": "${replaceBqPrefix('bq_react')}"`)
      : replaceBqPrefix(text);
  if (next !== text) await writeFile(file, next);
}

function shouldRewrite(file, inSrc) {
  if (inSrc) return textExtensions.has(path.extname(file));
  const base = path.basename(file);
  return base === 'package.json' || base === 'package-lock.json';
}

async function processDir(dir) {
  const relativeDir = path.relative(root, dir);
  const inSrc = relativeDir === 'src' || relativeDir.startsWith(`src${path.sep}`);
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (skipDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await processDir(full);
    } else if (entry.isFile() && shouldRewrite(full, inSrc)) {
      await rewriteFile(full);
    }
  }

  if (!inSrc) return;

  const after = await readdir(dir, { withFileTypes: true });
  for (const entry of after) {
    const nextName = replaceBqPrefix(entry.name);
    if (nextName === entry.name) continue;
    await rename(path.join(dir, entry.name), path.join(dir, nextName));
  }
}

await processDir(root);
console.log(`已将 bq 前缀替换为 ${projectName}`);
