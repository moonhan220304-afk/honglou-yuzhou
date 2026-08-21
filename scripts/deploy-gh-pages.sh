#!/bin/bash
# 红楼宇宙 GitHub Pages 一键部署
# 用法: ./scripts/deploy-gh-pages.sh
set -e

REPO_DIR=/tmp/hlm-pages
REPO_URL=git@github.com:moonhan220304-afk/honglou-yuzhou.git
BRANCH=main

echo "==> 1/3 构建静态站点"
NEXT_PUBLIC_BASE_PATH=/honglou-yuzhou npm run build

echo "==> 2/3 同步到部署仓库"
rm -rf "$REPO_DIR"
mkdir -p "$REPO_DIR"
cp -r out/* "$REPO_DIR/"
touch "$REPO_DIR/.nojekyll"

cd "$REPO_DIR"
if [ ! -d .git ]; then
  git init -q
  git remote add origin "$REPO_URL"
fi
git add -A
git commit -q -m "deploy $(date '+%Y-%m-%d %H:%M')" || echo "无变更"
git push -q origin "$BRANCH" --force

echo "==> 3/3 完成"
echo "在线地址: https://moonhan220304-afk.github.io/honglou-yuzhou/"
echo "（GitHub Pages 构建约需 30-60 秒生效）"
