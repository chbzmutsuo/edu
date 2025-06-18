from pathlib import Path

# Markdown要件定義の内容

requirements_md = """

# おうちスタンプラリーアプリ 要件定義

## 概要

子どもの生活習慣を促すための、家族向け習慣記録アプリ。
子どもが行動ごとに評価を申請し、親が承認することでスタンプや演出が表示される。

---

## 技術スタック

- フロントエンド：Next.js（App Router）
- バックエンド：API Routes / Server Actions
- ORM：Prisma
- データベース：PostgreSQL
- 認証：NextAuth（親・子アカウント）

---

## ユーザー種別

### 親アカウント

- 家族単位で管理（家族IDで紐付け）
- 子アカウント作成・管理
- 評価の承認／却下（コメント付き）
- 評価項目とスコア（レベル）の追加・編集

### 子アカウント

- 自分の行動に対して1日1回、評価を申請
- 承認後に演出とスタンプを確認
- 編集は申請前まで可能

---

## 機能一覧

### 評価項目（習慣）

- 家族単位で管理される
- 項目は自由に追加・編集・削除可
- 表示順（order）指定可能

### 評価レベル（スコア）

各項目に最大3つ程度のスコアを設定可能：

- `score`: 数値（1〜3など）
- `title`: 短いラベル（例：スッキリ）
- `description`: 補足説明
- `icon_url`: 表示アイコン
- `achievement_img_url`: 承認演出に使う画像

### 評価申請

- 子アカウントが項目単位で申請（1日1回制限）
- 申請には評価レベルを選択
- 状態：`pending` / `approved` / `rejected`
- 親による承認時にコメントを付与可能

### 承認演出（アニメーション＋音声）

- 初開封時のみ、アニメーション＋音声再生
- `openedByChild` フラグで再表示抑制
- 中央に表示する任意画像を動的に差し替え可能
- 演出レベル：`light` / `medium` / `heavy`

---

## データモデル（Prisma準拠）

### Family / Parent / Child

- `Family`: 親子共通のグループID
- `Parent`: 家族内の管理者
- `Child`: 習慣記録の対象者

### EvaluationItem

```ts
id: string
title: string
order: number
familyId: string
```
