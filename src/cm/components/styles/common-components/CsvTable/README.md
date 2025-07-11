# CsvTable コンポーネント

CsvTableはServer ComponentとClient Componentの両方で利用可能なテーブルコンポーネントです。
`records`のみを受け取るシンプルな構造で、重複した変換処理を排除しています。

## 基本的な使用方法

### 1. Server Component（通常のテーブル）

```tsx
import {CsvTable} from '@components/styles/common-components/CsvTable/CsvTable'

// Server Componentで使用
const MyPage = () => {
  return CsvTable({
    records: [
      {
        csvTableRow: [
          {label: 'ID', cellValue: '1'},
          {label: '名前', cellValue: '田中太郎'},
          {label: 'メール', cellValue: 'tanaka@example.com'},
        ],
      },
      {
        csvTableRow: [
          {label: 'ID', cellValue: '2'},
          {label: '名前', cellValue: '佐藤花子'},
          {label: 'メール', cellValue: 'sato@example.com'},
        ],
      },
    ],
  }).WithWrapper()
}
```

### 2. Client Component（チャンク処理あり）

```tsx
'use client'
import {CsvTableChunked} from '@components/styles/common-components/CsvTable/CsvTableChunked'

// Client Componentで使用
const MyComponent = () => {
  return CsvTableChunked({
    records: data,
    chunked: {
      enabled: true,
      chunkSize: 25,
      showProgress: true,
      showControls: true,
    },
  }).WithWrapper()
}
```

## データ構造

### CsvTableProps

```tsx
type CsvTableProps = {
  records: bodyRecordsType // 必須：テーブルデータ
  stylesInColumns?: stylesInColumns // オプション：列スタイル
  csvOutput?: {
    // オプション：CSV出力設定
    fileTitle: string
    dataArranger?: (records: bodyRecordsType) => Promise<any[]>
  }
  chunked?: ChunkedOptions // オプション：チャンク処理設定
}
```

### records構造

```tsx
type csvTableRow = {
  csvTableRow: csvTableCol[]
  // 行レベルのプロパティ（オプション）
  className?: string
  style?: CSSProperties
  onClick?: () => void
}

type csvTableCol = {
  label?: any // ヘッダー表示用
  cellValue: any // セル表示用
  cellValueRaw?: any // CSV出力用（未指定時はcellValueを使用）
  // セルレベルのプロパティ（オプション）
  className?: string
  style?: CSSProperties
  thStyle?: CSSProperties // ヘッダー専用スタイル
  rowSpan?: number
  colSpan?: number
  onClick?: () => void
}
```

## アーキテクチャ

### 抜本的な改善点

1. **単一データソース**: `records`のみを受け取り、`headerRecords`と`bodyRecords`の重複を排除
2. **自動変換**: 内部で`separateHeaderAndBody`関数がヘッダーとボディを自動分離
3. **型安全性**: 明確な型定義とプロパティ型の分離
4. **コードの簡潔性**: 変換処理や重複したロジックを削除

### コンポーネント構成

- **`CsvTable`**: Server Component対応、チャンク処理なし
- **`CsvTableChunked`**: Client Component、チャンク処理あり
- **`createCsvTableCore`**: 共通レンダリングロジック
- **`separateHeaderAndBody`**: records分離ロジック

## 実際の使用例

### 基本的なテーブル

```tsx
const users = [
  {id: 1, name: '田中太郎', email: 'tanaka@example.com'},
  {id: 2, name: '佐藤花子', email: 'sato@example.com'},
]

const UserTable = () => {
  return CsvTable({
    records: users.map(user => ({
      csvTableRow: [
        {label: 'ID', cellValue: user.id},
        {label: '名前', cellValue: user.name},
        {label: 'メール', cellValue: user.email},
      ],
    })),
  }).WithWrapper()
}
```

### 複雑なスケジュール表（TBM例）

```tsx
'use client'
import {CsvTableChunked} from '@components/styles/common-components/CsvTable/CsvTableChunked'

export const ScheduleTable = ({userList, days}) => {
  return CsvTableChunked({
    records: userList.map(user => ({
      csvTableRow: [
        {
          label: 'ユーザー',
          cellValue: <UserTh user={user} />,
          style: {position: 'sticky', left: 0, background: '#d8d8d8'},
        },
        ...days.map(date => ({
          label: formatDate(date, 'M/D(ddd)'),
          cellValue: <ScheduleCell user={user} date={date} />,
          thStyle: {background: '#d8d8d8', fontWeight: 'bold'},
        })),
      ],
    })),
    chunked: {
      enabled: true,
      chunkSize: 20,
      delay: 32,
      showProgress: true,
      showControls: true,
    },
  }).WithWrapper({className: 'max-w-[95vw] max-h-[75vh]'})
}
```

### CSV出力付きテーブル

```tsx
const ExportableTable = ({data}) => {
  return CsvTable({
    records: data.map(item => ({
      csvTableRow: [
        {
          label: 'ID',
          cellValue: item.id,
          cellValueRaw: item.id, // CSV用の値
        },
        {
          label: '名前',
          cellValue: <strong>{item.name}</strong>, // 表示用（装飾あり）
          cellValueRaw: item.name, // CSV用（プレーンテキスト）
        },
      ],
    })),
    csvOutput: {
      fileTitle: 'ユーザー一覧',
      dataArranger: async records => {
        // カスタムCSV変換ロジック
        return records.map(record => ({
          ID: record.csvTableRow[0].cellValueRaw,
          名前: record.csvTableRow[1].cellValueRaw,
        }))
      },
    },
  }).WithWrapper()
}
```

## 移行ガイド

### 旧構造からの移行

```tsx
// Before（旧構造）
CsvTable({
  headerRecords: [...],
  bodyRecords: [...],
  records: [...]  // 重複
})

// After（新構造）
CsvTable({
  records: [
    {
      csvTableRow: [
        { label: 'ヘッダー1', cellValue: 'データ1' },
        { label: 'ヘッダー2', cellValue: 'データ2' }
      ]
    }
  ]
})
```

### プロパティ名の変更

- ~~`headerRecords`~~ → `records`に統合
- ~~`bodyRecords`~~ → `records`に統合
- ~~`SP`プロパティ~~ → 削除（使用されていない機能）

## チャンク処理オプション

| プロパティ     | 型      | デフォルト | 説明                       |
| -------------- | ------- | ---------- | -------------------------- |
| `enabled`      | boolean | -          | チャンク処理の有効/無効    |
| `chunkSize`    | number  | 25         | 一度に処理するレコード数   |
| `delay`        | number  | 32         | レンダリング間隔（ミリ秒） |
| `autoStart`    | boolean | true       | 自動的にチャンク処理を開始 |
| `showProgress` | boolean | false      | プログレスバーを表示       |
| `showControls` | boolean | false      | 制御ボタンを表示           |

## 使い分けのガイドライン

| ケース                 | 推奨コンポーネント | 理由                      |
| ---------------------- | ------------------ | ------------------------- |
| 静的データ表示         | `CsvTable`         | Server Component、SEO対応 |
| 大量データ（50件以上） | `CsvTableChunked`  | パフォーマンス向上        |
| インタラクティブ機能   | `CsvTableChunked`  | Client Component必須      |
| CSV出力のみ            | `CsvTable`         | シンプルで十分            |

## 改善されたポイント

### ✅ コードの簡潔性

- 重複した変換処理を削除
- `headerRecords`と`bodyRecords`の分離ロジックを統一
- 型定義の整理

### ✅ 保守性の向上

- 単一データソース（`records`のみ）
- 明確な責務分離
- 一貫性のあるAPI

### ✅ パフォーマンス

- 不要な変換処理を削除
- メモリ使用量の削減
- レンダリング効率の向上

### ✅ 型安全性

- 明確な型定義
- プロパティの型エラー防止
- IntelliSenseの改善
