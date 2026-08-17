# AI業務改善診断（MVP）

中小企業の経営者・管理職向けに、10問の質問から「AI導入でどれくらい業務時間・コストを削減できそうか」を簡易診断し、無料相談への申し込みにつなげるWebアプリです。Instagram広告等からの流入を想定し、UTM計測・GA4/Meta Pixel・相談内容の保存/通知・管理画面・プライバシーポリシーを備えています。

## 1. 起動方法

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開くと確認できます。**環境変数を何も設定しなくても、診断〜相談送信〜管理画面までひと通り動作します。**

本番ビルドの確認：

```bash
npm run build
npm start
```

環境変数を設定する場合は `.env.example` を `.env.local` にコピーして値を入れてください（3章参照）。

```bash
cp .env.example .env.local
```

## 2. アプリの構成

```
app/
  page.tsx            トップページ（ファーストビュー・CTA）
  diagnosis/page.tsx   診断画面（質問を1問ずつ表示、プログレスバー付き）
  result/page.tsx      診断結果画面（削減時間・コスト・おすすめ度・TOP3・算出根拠・無料相談CTA）
  contact/page.tsx     無料相談フォーム（プライバシーポリシー同意チェックボックス付き）
  thanks/page.tsx      フォーム送信後のサンクス画面
  privacy/page.tsx     プライバシーポリシー
  admin/page.tsx       相談一覧の管理画面（パスワード保護）
  admin/login/page.tsx 管理画面ログイン
  api/leads/route.ts   相談フォームの保存API（ファイル保存＋メール／Webhook通知）
  api/events/route.ts  計測イベントの受信API（ローカル確認用）
  api/admin/login, logout/route.ts  管理画面の認証API
  layout.tsx           全体レイアウト（DiagnosisProvider・GA4・Meta Pixel・UTM捕捉を配置）

components/
  QuestionInput.tsx     質問タイプ（選択式／数値入力／スライダー）ごとの入力UI
  ProgressBar.tsx       診断の進捗バー
  PrimaryButton.tsx     共通の主要CTAボタン
  Header.tsx / Container.tsx  共通レイアウトパーツ
  GoogleAnalytics.tsx   GA4タグ（NEXT_PUBLIC_GA_MEASUREMENT_ID未設定なら何も読み込まない）
  MetaPixel.tsx         Meta Pixelタグ（NEXT_PUBLIC_META_PIXEL_ID未設定なら何も読み込まない）
  UtmCapture.tsx        URLのUTMパラメータをsessionStorageへ保存
  AdminLogoutButton.tsx 管理画面のログアウトボタン

context/
  DiagnosisContext.tsx  診断の回答をアプリ全体で保持するReact Context
                         （sessionStorageにも保存し、リロードしても回答が消えにくいようにしている）

lib/
  questions.ts       診断の質問定義（10問）。質問文・入力タイプはここで管理
  types.ts           回答・診断結果などの型定義
  constants.ts        診断ロジックの係数（★変更はここだけでOK。詳細は4章）
  calculate.ts        回答から診断結果を算出するロジック本体
  contactStorage.ts   サンクス画面表示用に、送信内容をブラウザに一時保持するヘルパー
  publicEnv.ts         クライアントに公開するGA4/Meta Pixelの環境変数（NEXT_PUBLIC_*）
  serverEnv.ts         サーバー専用の環境変数（メール・Webhook・管理画面パスワード）
  utm.ts               UTMパラメータの取得・保存
  analytics.ts          diagnosis_start/diagnosis_complete/contact_submitの計測ヘルパー
  leadStorage.server.ts 相談内容をローカルファイル(data/leads.jsonl)に保存
  eventStorage.server.ts 計測イベントをローカルファイル(data/events.jsonl)に保存
  notify.server.ts      相談内容をメール(Resend)・Webhookで通知
```

### 画面遷移

```
/ (トップ)
  → /diagnosis (質問1〜10、1問ずつ回答)
    → /result (診断結果・算出根拠・無料相談CTA)
      → /contact (無料相談フォーム)
        → /thanks (サンクス画面)

/admin/login → /admin (相談一覧、パスワード保護)
```

回答データはReact Context（`DiagnosisProvider`）とブラウザの `sessionStorage` に保持しています。`/result` に直接アクセスするなど回答が未入力の場合は自動的に `/diagnosis` へリダイレクトされます。

## 3. 環境変数

`.env.example` を `.env.local` にコピーして使用します。**すべて未設定のままでもローカルでの動作確認は可能です。**

| 変数名 | 用途 | 未設定時の挙動 |
|---|---|---|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4の測定ID | GA4タグを読み込まない |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta PixelのID | Pixelタグを読み込まない |
| `RESEND_API_KEY` | 相談通知メール送信用（[Resend](https://resend.com)のAPIキー） | メール通知をスキップ |
| `ADMIN_NOTIFY_EMAIL` | 通知を受け取る管理者メールアドレス | メール通知をスキップ |
| `LEAD_NOTIFY_FROM_EMAIL` | 通知メールの送信元アドレス | `onboarding@resend.dev`（Resendのテスト用アドレス） |
| `LEADS_WEBHOOK_URL` | 相談内容をPOSTするWebhook URL（Slack Incoming Webhook等） | Webhook通知をスキップ |
| `ADMIN_ACCESS_KEY` | `/admin` のログインパスワード | 開発時は `dev-admin` で仮ログイン可能。本番では未設定だと `/admin` にアクセス不可 |

## 4. 相談内容の保存としくみ

無料相談フォームを送信すると `POST /api/leads` が呼ばれ、以下を並行して試みます（`lib/notify.server.ts` / `lib/leadStorage.server.ts`）。

1. **ローカルファイル保存**（`data/leads.jsonl`）：常に試みるベストエフォートのバックアップ。ただしVercel等のサーバーレス環境ではデプロイ・インスタンスをまたいで永続化されない場合があります。
2. **メール通知**（`RESEND_API_KEY` / `ADMIN_NOTIFY_EMAIL` 設定時）：Resend経由で管理者に即座にメール通知します。
3. **Webhook通知**（`LEADS_WEBHOOK_URL` 設定時）：Slack等へJSONをPOSTします。

**3つとも失敗した場合のみ**エラーを返し、フォーム側は「送信に失敗しました」と表示してサンクス画面に遷移しません（＝ユーザーに嘘の完了表示をしない設計）。

**本番でInstagram広告から集客する場合は、メール通知またはWebhook通知のいずれかを必ず設定してください。** ファイル保存だけに頼ると、サーバーレス環境では相談内容を取りこぼす可能性があります。

管理画面（`/admin`、要ログイン）では、保存済みの相談一覧（会社名・氏名・メール・相談内容・診断結果サマリー・流入元UTM）を確認できます。メール／Webhookが未設定の場合は画面上に警告が表示されます。

## 5. 計測イベント

`lib/analytics.ts` の `trackEvent()` が、以下3つのイベントで発火します。

| イベント名 | 発火タイミング |
|---|---|
| `diagnosis_start` | 診断画面（`/diagnosis`）を開いたとき |
| `diagnosis_complete` | 診断結果画面（`/result`）で結果が表示されたとき |
| `contact_submit` | 無料相談フォームの送信が成功したとき |

各イベントは次の3箇所へ送信されます。

- GA4（`window.gtag`。`NEXT_PUBLIC_GA_MEASUREMENT_ID`設定時のみ）
- Meta Pixel（`window.fbq`のカスタムイベント。`NEXT_PUBLIC_META_PIXEL_ID`設定時のみ）
- 自社API `/api/events`（`data/events.jsonl`に保存。GA4/Pixel未設定でもローカルでイベント発火を確認するための仕組み）

ブラウザの開発者コンソールでも `[track] diagnosis_start {...}` のようにログ出力されます（開発モードのみ）。

## 6. 診断ロジック

質問3〜9（メール作成、議事録作成など7つの業務）で回答してもらう「従業員1人あたりの週間時間」をもとに、以下の式で算出しています（`lib/calculate.ts`）。診断結果画面にも同内容を簡潔に表示しています。

```
その業務の年間削減時間
  = 1人あたり週間時間
  × 事務作業をする人数（Q2の回答）
  × 52週
  × その業務の削減率（lib/constants.ts の REDUCTION_RATE）
  × 生成AI活用度による補正係数（Q10の回答、AI_USAGE_ADJUSTMENT）

年間削減コスト = 年間削減時間 × 平均時給（HOURLY_WAGE_YEN）
```

- 7つの業務ごとの削減時間・削減コストを算出し、合計値を「年間削減可能時間／コスト」として表示
- 削減時間が大きい上位3業務を「改善効果が高い業務TOP3」として表示
- 「AI化おすすめ度」は、年間削減時間の合計をしきい値で5段階評価（`RECOMMENDATION_SCORE_THRESHOLDS`）

あくまでMVP向けの簡易ロジックであり、厳密な調査データに基づくものではありません。

## 7. 削減率などの設定値を変更する場所

すべて **`lib/constants.ts`** に集約しています。ここを変更するだけで診断結果の算出ルールを調整できます。

| 定数 | 内容 |
|---|---|
| `WORK_WEEKS_PER_YEAR` | 年間の稼働週数（デフォルト52週） |
| `HOURLY_WAGE_YEN` | 削減コスト算出に使う平均時給（デフォルト3,000円） |
| `REDUCTION_RATE` | 業務ごとのAI導入による削減率（0〜1） |
| `TASK_LABELS` | 業務名の表示ラベル |
| `AI_USAGE_ADJUSTMENT` | 現在の生成AI活用度による補正係数（未導入/一部導入/積極活用） |
| `RECOMMENDATION_SCORE_THRESHOLDS` | 「AI化おすすめ度」（★1〜5）の判定しきい値 |

質問文やUIタイプ（選択式／数値入力／スライダー）を変更したい場合は **`lib/questions.ts`** を編集してください。

## 8. 公開前に必ず確認すること

- **`app/privacy/page.tsx`** 内の `[事業者名を記入]` `[連絡先メールアドレスを記入]` `[YYYY年MM月DD日]` を実際の情報に置き換えてください。
- 本番環境では **`ADMIN_ACCESS_KEY`** を必ず設定してください（未設定だと `/admin` にアクセスできません＝安全側のデフォルトです）。
- 本番での相談内容の取りこぼしを防ぐため、**`RESEND_API_KEY`+`ADMIN_NOTIFY_EMAIL`** または **`LEADS_WEBHOOK_URL`** のいずれかを設定してください。
- Resendを使う場合、`LEAD_NOTIFY_FROM_EMAIL` は検証済みドメインのアドレスにする必要があります（詳細はResendのドキュメント参照）。

## 9. 今後追加するとよさそうな機能

- 相談内容・診断結果をデータベース（Supabase等）に保存し、より本格的な管理画面（検索・ステータス管理）を用意する
- 無料相談フォームのCRM連携（HubSpot等）
- 診断ロジックの精緻化（業種別の削減率、実績データに基づくベンチマークなど）
- 診断結果ページのシェア機能（SNSシェア、PDF/画像でのダウンロード）
- A/Bテストによるコピー・デザインの継続的な改善
- フォームのスパム対策（reCAPTCHA等）の強化
- ログイン機能や決済機能（有料相談・診断結果の詳細レポート提供など）
