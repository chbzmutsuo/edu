# Sara App - NextAuth統合のための変更点

## 実施済み作業

### 1. データベース統合

- `schema.prisma`のUser統合完了：`saraFamilyId` → `familyId`に変更
- `Sara.prisma`でFamily/Activity/ActivityScore/ActivityEvaluationRequestモデル統合完了

### 2. Server Actions基盤作成

- `auth-actions.ts`: 家族登録機能（NextAuth用に簡素化済み）
- `activity-actions.ts`: 習慣管理機能（NextAuth統合待ち）
- `request-actions.ts`: 評価申請管理機能（NextAuth統合待ち）
- `dashboard-actions.ts`: ダッシュボード機能（NextAuth統合待ち）

### 3. 型定義更新

- `types.ts`: Family/Activity/Request関連型定義完了
- `next-auth.d.ts`: `saraFamilyId` → `familyId`に変更済み

### 4. 不要ファイル削除

- `session.ts`: NextAuth使用のため削除済み

## 残り作業

### 1. NextAuth設定の確認

正しい`authOptions`のインポートパスを確認し、以下のファイルで修正：

- `activity-actions.ts`
- `request-actions.ts`
- `dashboard-actions.ts`

現在のコメントアウト箇所：

```typescript
// TODO: 正しいauthOptionsのパスに修正してください
// import {authOptions} from '../../../../api/auth/[...nextauth]/constants/authOptions.tsx'
```

### 2. Server Actions実装復活

`authOptions`パス修正後、各ファイルのコメントアウトされた実装を復活させる：

**activity-actions.ts:**

- `activity__getAll()`: 習慣一覧取得
- `activity__create()`: 習慣作成
- `activity__update()`: 習慣更新
- `activity__delete()`: 習慣削除

**request-actions.ts:**

- `request__getAll()`: 評価申請一覧取得
- `request__create()`: 評価申請作成
- `request__approve()`: 評価申請承認・却下
- `request__markAsOpened()`: 開封状態更新
- `request__getUnreadCount()`: 未読数取得

**dashboard-actions.ts:**

- `dashboard__getStats()`: 統計取得
- `dashboard__getFamilyMembers()`: 家族メンバー取得
- `dashboard__getTodayProgress()`: 今日の進捗取得

### 3. 他ファイルの`saraFamilyId`更新

以下のファイルでも`saraFamilyId` → `familyId`への変更が必要：

- `nextauth-api.ts`
- API Routes各種
- その他Saraアプリ内ファイル

### 4. フロントエンド統合

NextAuthProviderとの統合、ログイン/登録フローの最終調整

## 技術仕様

### Server Actions命名規則

- `prefix__actionName`形式（例：`auth__register`、`activity__create`）
- 非同期関数のみエクスポート
- 統一したActionResponse型使用

### セッション管理

- NextAuthのgetServerSession使用
- session.user.familyIdで家族ID取得
- session.user.typeで親子判別（'parent' | 'child'）

### データベース設計

- Userテーブル統合：type='parent'|'child'で判別
- familyIdリレーション使用
- Family/Activity/ActivityScore/ActivityEvaluationRequestモデル

## 注意事項

1. authOptionsの正しいパスを確認してからServer Actions実装を復活
2. NextAuthの設定でsession.user構造を確認
3. familyIdの型（string/number）を統一
4. 既存データのマイグレーション確認
