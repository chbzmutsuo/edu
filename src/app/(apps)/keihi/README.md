# 経費記録＋インサイト生成アプリ

MoneyForwardへの経費入力を効率化し、AIによるビジネス・技術インサイトを自動生成するアプリです。

## 🎯 主な機能

### 1. 経費記録フォーム
- 日付、金額、科目、場所、相手名などの基本情報入力
- 会話の目的、キーワード、学びの深さなどの詳細情報
- 会話内容の要約記録

### 2. AI画像認識（ChatGPT Vision API）
- 領収書画像をアップロードして自動でOCR＋内容解析
- 日付、金額、科目、取引先名を自動抽出
- フォームに自動反映（編集可能）

### 3. AIインサイト生成
- 営業・ビジネス観点での洞察（詳細・要約）
- 技術・開発観点での洞察（詳細・要約）
- 自動タグ生成（複数、分類あり）

### 4. MoneyForward用CSV出力
- journal_sample形式でのCSV出力
- 全件出力・選択出力に対応
- 勘定科目・税区分の自動マッピング

## 🛠 技術スタック

- **フロントエンド**: Next.js 15, React 18, Tailwind CSS
- **バックエンド**: Server Actions, Prisma ORM
- **データベース**: PostgreSQL
- **AI**: OpenAI ChatGPT Vision API (gpt-4o)
- **その他**: TypeScript, react-toastify

## 📁 ディレクトリ構造

```
src/app/(apps)/keihi/
├── actions/                 # Server Actions
│   ├── expense-actions.ts   # 経費記録CRUD・AI解析
│   └── csv-actions.ts       # CSV出力
├── (pages)/                 # ページコンポーネント
│   ├── new/                 # 新規登録フォーム
│   └── [id]/                # 詳細ページ
├── page.tsx                 # 一覧ページ
└── requirements/            # 要件定義書・サンプルファイル
```

## 🚀 セットアップ

### 1. 環境変数設定

`.env.local`ファイルを作成し、以下を設定：

```bash
# OpenAI API Key (必須)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Database URL
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

### 2. データベースマイグレーション

```bash
# Prismaスキーマを反映
npx prisma db push

# または
npx prisma migrate dev
```

### 3. 開発サーバー起動

```bash
npm run dev
```

## 📋 使い方

### 1. 新規経費記録作成
1. `/keihi/new` にアクセス
2. 領収書画像をアップロード（任意）→ AI自動解析
3. フォーム内容を確認・編集
4. 「作成」ボタンで保存

### 2. 記録一覧・詳細確認
1. `/keihi` で一覧表示
2. 各記録の「詳細」リンクで詳細ページへ
3. AIインサイト・タグ・MF用情報を確認

### 3. MoneyForward用CSV出力
1. 一覧ページで「全件CSV出力」または記録を選択して「選択CSV出力」
2. ダウンロードされたCSVをMoneyForwardにインポート

## 🔧 カスタマイズ

### 勘定科目の追加・変更
`actions/expense-actions.ts` の `MAJOR_ACCOUNTS` 配列を編集

### AIプロンプトの調整
`analyzeReceiptImage()` および `generateInsights()` 関数内のプロンプトを編集

### CSV出力形式の変更
`actions/csv-actions.ts` の `generateMFCSV()` 関数を編集

## 📝 注意事項

- OpenAI APIは有料サービスです（Vision APIは特に高額）
- 画像解析の精度は領収書の品質に依存します
- CSV出力はMoneyForward仕様に準拠していますが、バージョンアップ等で変更される可能性があります

## 🐛 トラブルシューティング

### Prismaエラーが発生する場合
```bash
npx prisma generate
npx prisma db push
```

### OpenAI APIエラーが発生する場合
- APIキーが正しく設定されているか確認
- OpenAIアカウントの残高・利用制限を確認
- gpt-4oモデルへのアクセス権限を確認

## 📄 ライセンス

このプロジェクトは社内利用を想定しています。
