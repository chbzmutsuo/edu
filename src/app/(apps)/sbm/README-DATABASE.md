# SBM - 仕出し弁当管理システム データベースセットアップ

## 📋 概要

このドキュメントは、SBM（仕出し弁当管理システム）のデータベース設定と初期セットアップの手順を説明します。

## 🔧 環境要件

- Node.js 18以上
- PostgreSQL 14以上 (または MySQL 8.0以上)
- Prisma CLI

## 📊 データベーススキーマ

### 主要テーブル

- `sbm_customers` - 顧客マスタ
- `sbm_products` - 商品マスタ
- `sbm_users` - ユーザーマスタ
- `sbm_reservations` - 予約データ
- `sbm_reservation_items` - 予約商品明細
- `sbm_delivery_teams` - 配達チーム
- `sbm_delivery_assignments` - 配達割当
- `sbm_rfm_analysis` - RFM分析データ

## 🚀 セットアップ手順

### 1. 環境変数の設定

`.env`ファイルにデータベース接続情報を設定：

```env
# PostgreSQLの場合
DATABASE_URL="postgresql://username:password@localhost:5432/sbm_db?schema=public"

# MySQLの場合
DATABASE_URL="mysql://username:password@localhost:3306/sbm_db"
```

### 2. Prismaセットアップ

```bash
# Prismaクライアントの生成
npx prisma generate

# データベースのマイグレーション実行
npx prisma db push

# または、マイグレーションファイルを使用する場合
npx prisma migrate dev --name init
```

### 3. データベース初期化（開発環境のみ）

アプリケーション内の「データ管理」ページから、以下の操作が可能です：

- **サンプルデータ生成**: 開発・テスト用のデータを自動生成
- **データベース初期化**: 全データの削除（⚠️本番では使用禁止）
- **データエクスポート**: バックアップ用JSONファイルの生成
- **データインポート**: JSONファイルからのデータ復元

### 4. 動作確認

```bash
# アプリケーションの起動
npm run dev

# ブラウザで http://localhost:3000/sbm にアクセス
# 「データ管理」ページでサンプルデータを生成
```

## 📈 マイグレーション管理

### 新しいマイグレーションの作成

```bash
# スキーマ変更後にマイグレーション作成
npx prisma migrate dev --name [変更内容の説明]

# 例: カラム追加の場合
npx prisma migrate dev --name add_customer_notes_column
```

### 本番環境へのデプロイ

```bash
# マイグレーションの適用（本番環境）
npx prisma migrate deploy

# Prismaクライアントの生成
npx prisma generate
```

## 🔒 セキュリティ考慮事項

### 開発環境

- サンプルデータには実在しない架空の情報を使用
- 開発用データベースは本番から分離

### 本番環境

- **「データベース初期化」機能は絶対に使用しない**
- 定期的なバックアップの設定
- データベース接続情報の適切な管理
- アクセス制限の設定

## 📊 データ構造

### 主要なリレーション

```
Customer (顧客)
├── Reservations (予約)
│   ├── ReservationItems (商品明細)
│   ├── ReservationTasks (タスク)
│   └── ChangeHistory (変更履歴)
└── RFMAnalysis (RFM分析)

Product (商品)
├── PriceHistory (価格履歴)
└── ReservationItems (予約商品明細)

User (ユーザー)
├── Reservations (担当予約)
└── DeliveryAssignments (配達割当)

DeliveryTeam (配達チーム)
└── DeliveryAssignments (配達割当)
```

## 🛠️ トラブルシューティング

### よくある問題

1. **マイグレーションエラー**

   ```bash
   # スキーマをリセット（開発環境のみ）
   npx prisma migrate reset
   ```

2. **接続エラー**
   - DATABASE_URLの確認
   - データベースサーバーの起動確認
   - 認証情報の確認

3. **型エラー**
   ```bash
   # Prismaクライアントの再生成
   npx prisma generate
   ```

### データベース管理コマンド

```bash
# データベーススキーマの確認
npx prisma db pull

# データの直接確認・編集（開発環境のみ）
npx prisma studio

# マイグレーション履歴の確認
npx prisma migrate status
```

## 📝 開発ノート

### データベース設計のポイント

1. **外部キー制約**: データ整合性の確保
2. **インデックス**: 検索性能の最適化
3. **監査ログ**: 変更履歴の追跡
4. **ソフトデリート**: 重要データの論理削除

### パフォーマンス考慮事項

- 大量データの処理時はページネーション
- N+1問題の回避（include/selectの適切な使用）
- データベース接続プールの設定

## 📞 サポート

問題が発生した場合は、以下の情報と共にお問い合わせください：

- エラーメッセージ
- 実行したコマンド
- 環境情報（Node.js、データベースバージョン）
- 再現手順
