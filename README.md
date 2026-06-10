# Subrin

React Native + Expo + TypeScript で構築したサブスク管理アプリです。

## Environment Variables

`.env` を作成してください。Expo クライアントで使う値は `EXPO_PUBLIC_` プレフィックス付きで定義します。

```env
EXPO_PUBLIC_APP_NAME=
EXPO_PUBLIC_EXCHANGE_RATE_API_URL=
EXPO_PUBLIC_EXCHANGE_RATE_FALLBACK_API_URL=
EXPO_PUBLIC_SUBRIN_NOTIFICATION_API_URL=
EMAIL_PROVIDER=
RESEND_API_KEY=
EMAIL_FROM=
SUBRIN_CRON_SECRET=
```

用途:

- `EXPO_PUBLIC_APP_NAME`: アプリ内表示名
- `EXPO_PUBLIC_EXCHANGE_RATE_API_URL`: 為替レート取得 API
- `EXPO_PUBLIC_EXCHANGE_RATE_FALLBACK_API_URL`: 為替レートのフォールバック API
- `EXPO_PUBLIC_SUBRIN_NOTIFICATION_API_URL`: 通知同期 API のベース URL
- `EMAIL_PROVIDER`: バックエンドのメール送信プロバイダ
- `RESEND_API_KEY`: Resend のサーバー側 API キー
- `EMAIL_FROM`: 通知メール送信元
- `SUBRIN_CRON_SECRET`: バックエンドの定期実行保護用シークレット

注意:

- `EXPO_PUBLIC_` 付きの値はアプリに公開されます。秘密情報は入れないでください。
- `RESEND_API_KEY` や `SUBRIN_CRON_SECRET` はモバイルアプリでは使わず、バックエンド側でのみ利用してください。
- 実運用では `.env.example` をコピーして `.env` を作成してください。

## Setup

```bash
npm install
npx expo start
```

キャッシュを消して起動する場合:

```bash
npx expo start -c
```

## GitHub 公開前チェック

- `.env` が Git 管理対象外になっていること
- `.env.example` だけが公開されること
- API キーやトークンがコード内に直書きされていないこと
- `node_modules`, `.expo`, `dist`, `web-build` が追跡されていないこと
- SQLite のローカル DB ファイルが追跡されていないこと

# subscription-app
