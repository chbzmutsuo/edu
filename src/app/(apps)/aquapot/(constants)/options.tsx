const PAYMENT_METHOD_LIST = [`現金`, `クレジットカード`, `銀行振込`, `自動口座引落`, `その他`, `BASE`]
const AQCUSTOMER_STATUS_LIST = [`継続`, `単発`, `解約`]

/**
 * このようなマスタデータの作り方のメリット：
 * 1. コード内で直接アクセスできるため、実装が簡単
 * 2. 型安全性が確保できる（TypeScriptの恩恵）
 * 3. バージョン管理システムで変更履歴を追跡できる
 * 4. インポートして再利用が容易
 * 5. コンパイル時に検証できる
 *
 * デメリット：
 * 1. データ変更にはコードの修正とデプロイが必要
 * 2. 非開発者がデータを更新できない
 * 3. データ量が多くなると管理が煩雑になる
 * 4. 動的なデータ更新ができない
 * 5. 環境ごとに異なる値を持たせるのが難しい
 */
// オブジェクト形式で定義：キーでの参照が容易で、特定の銀行情報へのアクセスが速い
export const BANK_LIST = {
  '01': {
    abbriviation: '群馬銀行',
    bankName: '群馬銀行',
    branchName: '前橋北支店',
    accountType: '普通預金',
    accountNumber: '0895568',
    accountHolder: 'ユ）アクアポット',
  },
  '02': {
    abbriviation: '住信SBIネット銀行',
    bankName: '住信SBIネット銀行',
    branchName: '法人第一支店（106）',
    accountType: '普通口座',
    accountNumber: '2126002',
    accountHolder: 'ユ）アクアポット',
  },
}

const AQCUSTOMER_RECORD_TYPE_LIST = [`新規`, `メンテナンス`, `契約`, `FAX`, `その他`]
const AQCUSTOMER_RECORD_STATUS_LIST = [`処理済`, `対応中`, `キャンセル`]

const TAX_TYPE = [0, 8, 10]

const CUSTOMER = {
  AQCUSTOMER_STATUS_LIST,
  AQCUSTOMER_RECORD_STATUS_LIST,
  AQCUSTOMER_RECORD_TYPE_LIST,
}

export const AQ_CONST = {
  INVOICE_NUMBER: 'T1070002007606',
  BANK_LIST,
  PAYMENT_METHOD_LIST,
  TAX_TYPE,
  CUSTOMER,
}
