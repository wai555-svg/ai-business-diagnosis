# AI業務改善診断（MVP）

中小企業の経営者・管理職向けに、10問の質問から「AI導入でどれくらい業務時間・コストを削減できそうか」を簡易診断し、無料相談への申し込みにつなげるWebアプリのMVPです。

## 1. 起動方法

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開くと確認できます。

本番ビルドの確認：

```bash
npm run build
npm start
```

## 2. アプリの構成

```
app/
  page.tsx          トップページ（ファーストビュー・CTA）
  diagnosis/page.tsx 診断画面（質問を1問ずつ表示、プログレスバー付き）
  result/page.tsx    診断結果画面（削減時間・コスト・おすすめ度・TOP3・無料相談CTA）
  contact/page.tsx   無料相談フォーム
  thanks/page.tsx    フォーム送信後のサンクス画面
  layout.tsx         全体レイアウト（DiagnosisProviderでラップ）

components/
  QuestionInput.tsx  質問タイプ（選択式／数値入力／スライダー）ごとの入力UI
  ProgressBar.tsx    診断の進捗バー
  PrimaryButton.tsx  共通の主要CTAボタン
  Header.tsx / Container.tsx  共通レイアウトパーツ

context/
  DiagnosisContext.tsx  診断の回答をアプリ全体で保持するReact Context
                         （sessionStorageにも保存し、リロードしても回答が消えにくいようにしている）

lib/
  questions.ts    診断の質問定義（10問）。質問文・入力タイプはここで管理
  types.ts        回答・診断結果などの型定義
  constants.ts    診断ロジックの係数（★変更はここだけでOK。詳細は4章）
  calculate.ts    回答から診断結果を算出するロジック本体
  contactStorage.ts 無料相談フォームの入力内容を一時的に保持するヘルパー（MVPにつき外部送信なし）
```

### 画面遷移

```
/ (トップ)
  → /diagnosis (質問1〜10、1問ずつ回答)
    → /result (診断結果・無料相談CTA)
      → /contact (無料相談フォーム)
        → /thanks (サンクス画面)
```

回答データはReact Context（`DiagnosisProvider`）とブラウザの `sessionStorage` に保持しています。`/result` に直接アクセスするなど回答が未入力の場合は自動的に `/diagnosis` へリダイレクトされます。

## 3. 診断ロジック

質問3〜9（メール作成、議事録作成など7つの業務）で回答してもらう「従業員1人あたりの週間時間」をもとに、以下の式で算出しています（`lib/calculate.ts`）。

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

## 4. 削減率などの設定値を変更する場所

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

## 5. 今後追加するとよさそうな機能

- GA4 / Meta Pixelなどの広告効果測定タグの導入、UTMパラメータの計測・保存
- 無料相談フォームの内容をメールやSlack、CRM（HubSpotなど）に自動送信・連携
- 診断結果・相談内容をデータベースに保存し、管理画面から一覧・分析できるようにする
- 診断ロジックの精緻化（業種別の削減率、実績データに基づくベンチマークなど）
- 診断結果ページのシェア機能（SNSシェア、PDF/画像でのダウンロード）
- A/Bテストによるコピー・デザインの継続的な改善
- フォームのスパム対策（reCAPTCHA等）・入力バリデーションの強化
- ログイン機能や決済機能（有料相談・診断結果の詳細レポート提供など）
