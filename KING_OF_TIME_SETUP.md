# KING OF TIME API 設定ガイド

## 1. 概要

このドキュメントでは、KING OF TIME Web APIを利用するための設定方法と認証情報の取得方法について説明します。

## 2. 必要な設定

### 2.1 環境変数の設定

`.env`ファイルに以下の環境変数を追加してください：

```bash
# KING OF TIME API設定
KING_OF_TIME_ACCESS_TOKEN=your_access_token_here
```

### 2.2 アクセストークンの取得方法

#### KING OF TIME管理画面での設定手順

1. **KING OF TIME管理画面にログイン**

   - URL: https://s3.kingtime.jp/admin （企業によって異なる場合があります）
   - 管理者権限のあるアカウントでログインしてください

2. **API設定画面へアクセス**

   - メニューから「設定」→「外部サービス連携」→「Web API」を選択
   - または「その他」→「Web API」を選択

3. **アクセストークンの発行**

   - 「新規トークン発行」ボタンをクリック
   - トークン名を入力（例：「データ連携用」）
   - 必要な権限を選択：
     - ✅ 企業情報データ（読み取り）
     - ✅ 従業員データ（読み取り）
     - ✅ 所属データ（読み取り）
     - ✅ 従業員グループデータ（読み取り）
     - ✅ 日別勤怠データ（読み取り）
   - 「発行」ボタンをクリック

4. **トークンの保存**

   - 発行されたアクセストークンをコピー
   - **重要**: トークンは一度しか表示されないため、必ず安全な場所に保存してください

5. **IPアドレス制限の設定（推奨）**
   - セキュリティのため、アクセス可能なIPアドレスを制限
   - 本番環境では固定IPアドレスを設定
   - 開発環境では一時的に自分のIPアドレスを追加

## 3. API利用時の注意事項

### 3.1 利用禁止時間帯

以下の時間帯（JST）はAPIの利用ができません：

- **8:30～10:00**
- **17:30～18:30**

### 3.2 レート制限

- **一般API**: 直近5分で500リクエスト
- **打刻データAPI**: 直近5分で2000リクエスト
- リクエスト間隔は1秒程度空けることを推奨

### 3.3 データ形式

- 日時表現: ISO 8601形式（例：`2016-05-10T10:00+09:00`）
- Content-Type: `application/json; charset=utf-8`

## 4. 実装したAPIエンドポイント

### 4.1 基本API

- `GET /api/kingOfTime` - API接続テスト
- `GET /api/kingOfTime/employees` - 従業員一覧取得
- `GET /api/kingOfTime/departments` - 所属データ取得
- `GET /api/kingOfTime/employee-groups` - 従業員グループデータ取得

### 4.2 勤怠データAPI

- `GET /api/kingOfTime/daily-work-records` - 日別勤怠データ取得
- `POST /api/kingOfTime/daily-work-records` - 複数日・複数従業員の一括取得

### 4.3 統合データAPI（推奨）

- `POST /api/kingOfTime/integrated-data` - 要求仕様に対応した統合データ取得

#### 統合データAPIの使用例

```javascript
const response = await fetch('/api/kingOfTime/integrated-data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    employeeCodes: ['EMP001', 'EMP002'], // 省略可能
    departmentCode: 'DEPT001', // 省略可能
  }),
})

const data = await response.json()
```

#### レスポンス形式

```json
{
  "success": true,
  "data": [
    {
      "所属コード": "DEPT001",
      "所属名": "営業部",
      "所属グループコード": "GROUP001",
      "所属グループ名": "営業グループ",
      "従業員コード": "EMP001",
      "名前": "田中 太郎",
      "日時": "2024-01-15",
      "所定時間": 480,
      "所定外時間": 60,
      "残業時間": 60
    }
  ]
}
```

## 5. トラブルシューティング

### 5.1 よくあるエラー

#### 認証エラー（401 Unauthorized）

- アクセストークンが正しく設定されているか確認
- トークンの有効期限が切れていないか確認

#### IPアドレス制限エラー（403 Forbidden）

- 現在のIPアドレスが許可リストに含まれているか確認
- 本番環境では固定IPアドレスを使用

#### レート制限エラー（429 Too Many Requests）

- リクエスト間隔を1秒以上空ける
- 利用禁止時間帯を避ける

### 5.2 ログの確認

開発環境では、ブラウザの開発者ツールまたはサーバーログでエラー詳細を確認できます。

## 6. セキュリティ考慮事項

1. **アクセストークンの管理**

   - 環境変数で管理し、コードに直接記述しない
   - 定期的にトークンを更新する

2. **IPアドレス制限**

   - 本番環境では必ず固定IPアドレスを設定
   - 不要なIPアドレスは定期的に削除

3. **権限の最小化**
   - 必要最小限の権限のみを付与
   - 不要な権限は削除する

## 7. 参考リンク

- [KING OF TIME API公式ドキュメント](https://developer.kingoftime.jp/)
- [KING OF TIME サポートセンター](https://support.kingtime.jp/)

---

**注意**: このドキュメントは実装時点での情報です。最新の情報は公式ドキュメントを参照してください。
