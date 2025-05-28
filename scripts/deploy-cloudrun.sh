#!/bin/bash

# Cloud Run デプロイスクリプト
# 使用方法: ./scripts/deploy-cloudrun.sh [PROJECT_ID] [REGION] [SERVICE_NAME]

set -e

# デフォルト値
DEFAULT_PROJECT_ID="your-gcp-project-id"
DEFAULT_REGION="asia-northeast1"
DEFAULT_SERVICE_NAME="king-of-time-api"

# パラメータの取得
PROJECT_ID=${1:-$DEFAULT_PROJECT_ID}
REGION=${2:-$DEFAULT_REGION}
SERVICE_NAME=${3:-$DEFAULT_SERVICE_NAME}

echo "🚀 Cloud Run デプロイ開始"
echo "プロジェクトID: $PROJECT_ID"
echo "リージョン: $REGION"
echo "サービス名: $SERVICE_NAME"

# 1. Google Cloud プロジェクトの設定
echo "📋 Google Cloud プロジェクトを設定中..."
gcloud config set project $PROJECT_ID

# 2. 必要なAPIの有効化
echo "🔧 必要なAPIを有効化中..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# 3. Dockerイメージのビルドとプッシュ
echo "🏗️ Dockerイメージをビルド中..."
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"
docker build -f Dockerfile.cloudrun -t $IMAGE_NAME .

echo "📤 Dockerイメージをプッシュ中..."
docker push $IMAGE_NAME

# 4. Cloud Runにデプロイ
echo "🚀 Cloud Runにデプロイ中..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 540 \
  --concurrency 100 \
  --max-instances 10 \
  --set-env-vars "NODE_ENV=production" \
  --port 3000

# 5. 環境変数の設定（手動で設定が必要）
echo "⚠️  重要: 以下の環境変数を手動で設定してください:"
echo ""
echo "gcloud run services update $SERVICE_NAME \\"
echo "  --region $REGION \\"
echo "  --set-env-vars \"KING_OF_TIME_ACCESS_TOKEN=your_access_token_here\""
echo ""

# 6. サービスURLの取得
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')

echo "✅ デプロイ完了!"
echo "サービスURL: $SERVICE_URL"
echo ""
echo "🔍 ヘルスチェック:"
echo "curl $SERVICE_URL/health"
echo ""
echo "📊 API仕様確認:"
echo "curl $SERVICE_URL/api/kingOfTime/integrated-data-serverless"
echo ""
echo "🧪 API テスト例:"
echo "curl -X POST $SERVICE_URL/api/kingOfTime/integrated-data-serverless \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"startDate\":\"2024-01-01\",\"endDate\":\"2024-01-07\"}'"
