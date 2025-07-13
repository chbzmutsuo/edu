# 経費記録＋インサイト生成アプリ 仕様書

## 概要

MoneyForwardへの経費入力を効率化し、AIによるビジネス・技術インサイトを自動生成するアプリです。

## 主要機能

### 1. 画像読み取り機能（修正版）

#### AI解析による自動項目抽出

領収書画像をアップロードすると、以下の項目をAIが自動抽出します：

- **日付**: レシートから日付を読み取り
- **場所**: レシートから予測される場所・店舗名
- **金額**: 支払い金額
- **科目**: 適切な勘定科目を推定

#### 相手の入力方式

- **複数名対応**: 「Aさん（教師）」のような形式で複数名入力可能
- **その他複数名ボタン**: ワンクリックで「その他複数名」を入力
- **自由編集**: 手動で相手名を追加・編集可能

#### 会話の目的（チェックボックス形式）

複数選択可能なチェックボックスで以下の選択肢を提供：

```javascript
const conversationPurposes = [
  {value: '営業活動', label: '営業活動'},
  {value: 'リクルーティング', label: 'リクルーティング'},
  {value: '技術・アイデア相談', label: '技術相談'},
  {value: 'ビジネス相談', label: 'ビジネス相談'},
  {value: '研修・学習', label: '研修・学習'},
  {value: '情報交換', label: '情報交換'},
]
```

**初期値**: 「営業活動」「リクルーティング」をtrueに設定

#### キーワード自動生成

「相手」「会話の目的」「場所」「科目」から、想定される交流内容を予測し、2〜3つのキーワードを自動生成

### 2. 編集機能

すべての項目は自由に編集可能：

- 日付の変更
- 場所の修正
- 金額の調整
- 科目の変更
- 相手名の追加・削除
- 会話の目的の選択変更
- キーワードの追加・削除

### 3. AIインサイト生成（修正版）

#### 生成タイミング

画像読み取り後、項目を編集した後にインサイトのAI生成を実施

#### 生成内容

- **摘要**: 経費の簡潔な説明文
- **インサイト**: 従来の「営業・ビジネスインサイト」と「技術・開発インサイト」を統合した一つの枠
- **キーワード**: 自動生成キーワード（編集可能）
- **タグ管理**: 分類別タグ管理機能

### 4. データベース構造

#### KeihiExpense テーブル（修正が必要な項目）

```sql
-- 既存項目の修正
conversationPurpose  String[] -- 配列形式に変更（複数選択対応）

-- 新規項目
insight             String?  -- 統合されたインサイト
summary            String?  -- 摘要

-- 削除予定項目
businessInsightDetail  String? -- インサイトに統合
businessInsightSummary String? -- インサイトに統合
techInsightDetail      String? -- インサイトに統合
techInsightSummary     String? -- インサイトに統合
```

### 5. UI/UX要件

#### 画像読み取り画面

1. 画像アップロード・カメラ撮影機能
2. AI解析結果の表示（編集可能フォーム）
3. 相手名入力欄（複数対応）
4. 「その他複数名」ボタン
5. 会話の目的チェックボックス（初期値：営業活動、リクルーティング）
6. 自動生成キーワード表示

#### 編集画面

- すべての項目を自由に編集可能
- リアルタイムでキーワードを再生成
- インサイト生成ボタン

#### インサイト表示画面

- 摘要
- 統合されたインサイト
- キーワード・タグ管理

### 6. 技術仕様

#### フロントエンド

- Next.js 15 + React 18
- TypeScript
- Tailwind CSS
- react-hook-form（フォーム管理）

#### バックエンド

- Next.js Server Actions
- Prisma ORM
- PostgreSQL

#### AI連携

- OpenAI ChatGPT Vision API (gpt-4o)
- 画像解析 + テキスト生成

#### ファイル管理

- AWS S3（画像保存）
- 添付ファイル管理

### 7. 開発優先度

#### Phase 1（高優先度）

1. データベーススキーマ修正
2. 画像解析機能の修正（新しい項目抽出）
3. 相手名入力の複数対応
4. 会話の目的チェックボックス化

#### Phase 2（中優先度）

1. キーワード自動生成機能
2. インサイト統合機能
3. 摘要生成機能

#### Phase 3（低優先度）

1. UI/UX改善
2. パフォーマンス最適化
3. エラーハンドリング強化

### 8. API仕様

#### 画像解析API

```typescript
// Request
{
  imageDataList: string[] // Base64画像データ
}

// Response
{
  success: boolean
  data?: {
    date: string
    location: string
    amount: number
    subject: string
    suggestedCounterparties: string[]
    suggestedPurposes: string[]
    generatedKeywords: string[]
  }
  error?: string
}
```

#### インサイト生成API

```typescript
// Request
{
  formData: ExpenseFormData
  additionalInstruction?: string
}

// Response
{
  success: boolean
  data?: {
    summary: string
    insight: string
    keywords: string[]
    autoTags: string[]
  }
  error?: string
}
```

### 9. 制約事項

- OpenAI API利用料金の考慮
- 画像解析精度の限界
- レスポンス時間の最適化
- セキュリティ（画像データの取り扱い）

### 10. 今後の拡張予定

- 音声入力機能
- 定期的な支出パターン分析
- 予算管理機能
- レポート生成機能
