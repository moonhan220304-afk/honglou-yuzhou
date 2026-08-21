#!/bin/bash
# 红楼宇宙 阿里云 ECS 一键部署
# 用法: ./scripts/deploy-ecs.sh
# 前提: /tmp/ssh-askpass.sh 存在（含 SSH 密码）且可执行
set -e

SERVER=root@39.106.144.168
REMOTE_DIR=/srv/honglou-yuzhou
BASE_PATH=/honglou-yuzhou

echo "==> 1/3 构建静态站点（basePath=$BASE_PATH）"
nice -n 12 env NEXT_PUBLIC_BASE_PATH=$BASE_PATH npm run build

echo "==> 2/3 上传到 ECS $SERVER"
export SSH_ASKPASS=/tmp/ssh-askpass.sh SSH_ASKPASS_REQUIRE=force
rsync -az --delete --exclude='mobile/' -e "ssh -o StrictHostKeyChecking=no" out/ "$SERVER:$REMOTE_DIR/"

echo "==> 3/3 完成（nginx 无需重启，静态文件即时生效）"
echo "在线地址: http://39.106.144.168$BASE_PATH/"
