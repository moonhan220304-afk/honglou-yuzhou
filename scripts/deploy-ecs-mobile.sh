#!/bin/bash
# 移动版构建 + 部署（/honglou-yuzhou/m/）
# 用法: ./scripts/deploy-ecs-mobile.sh
set -e

SERVER=root@39.106.144.168
LOCAL_DIR=out-mobile
REMOTE_DIR=/srv/honglou-yuzhou/mobile
BASE_PATH=/honglou-yuzhou/m

echo "==> 1/3 构建移动版（basePath=$BASE_PATH, MOBILE=1）"
nice -n 12 env NEXT_PUBLIC_BASE_PATH=$BASE_PATH NEXT_PUBLIC_MOBILE=1 npm run build
rm -rf "$LOCAL_DIR"
mv out "$LOCAL_DIR"

echo "==> 2/3 上传到 ECS $REMOTE_DIR"
export SSH_ASKPASS=/tmp/ssh-askpass.sh SSH_ASKPASS_REQUIRE=force
rsync -az --delete -e "ssh -o StrictHostKeyChecking=no" "$LOCAL_DIR/" "$SERVER:$REMOTE_DIR/"

echo "==> 3/3 完成"
echo "移动版地址: http://39.106.144.168$BASE_PATH/"
