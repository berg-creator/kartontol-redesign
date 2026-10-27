#!/bin/bash
# Разворачивает функцию разбора писем в Яндекс Облаке и печатает её адрес.
# Повторный запуск только обновляет код.
set -e
cd "$(dirname "$0")"
yc=~/yandex-cloud/bin/yc
N=kartontol-ai
FOLDER=$($yc config get folder-id)

$yc iam service-account get $N >/dev/null 2>&1 || $yc iam service-account create --name $N >/dev/null
SA=$($yc iam service-account get $N | awk '/^id:/{print $2}')
$yc resource-manager folder add-access-binding "$FOLDER" --role ai.languageModels.user --subject serviceAccount:$SA >/dev/null 2>&1 || true

$yc serverless function get $N >/dev/null 2>&1 || $yc serverless function create --name $N >/dev/null
$yc serverless function allow-unauthenticated-invoke $N >/dev/null
$yc serverless function version create --function-name $N --runtime nodejs22 --entrypoint index.handler \
  --memory 128m --execution-timeout 30s --source-path . --service-account-id "$SA" \
  --environment FOLDER_ID="$FOLDER" >/dev/null

echo "https://functions.yandexcloud.net/$($yc serverless function get $N | awk '/^id:/{print $2}')"
