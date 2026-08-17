import Container from "@/components/Container";
import Header from "@/components/Header";

export const metadata = {
  title: "プライバシーポリシー｜AI業務改善診断",
};

export default function PrivacyPage() {
  return (
    <main className="flex flex-1 flex-col bg-slate-50">
      <Header />
      <div className="py-10">
        <Container>
          <h1 className="text-xl font-bold text-slate-900">プライバシーポリシー</h1>
          <p className="mt-2 text-xs text-slate-400">最終更新日：2026年8月18日</p>

          <div className="mt-6 space-y-6 text-sm leading-relaxed text-slate-600">
            <section>
              <h2 className="text-base font-bold text-slate-800">1. 事業者情報</h2>
              <p className="mt-2">
                本サービス「AI業務改善診断」（以下「本サービス」）は、Sato Writing Labo（以下「当社」）が提供します。
                お問い合わせ先：zxc552718@gmail.com
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800">2. 取得する情報</h2>
              <p className="mt-2">本サービスでは、以下の情報を取得する場合があります。</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>診断のご回答内容（従業員数、業務時間等。氏名や連絡先は含みません）</li>
                <li>無料相談フォームにご入力いただいた会社名・氏名・メールアドレス・相談内容</li>
                <li>
                  広告経由での流入元情報（UTMパラメータ等）、閲覧ページ、操作イベント（診断開始・完了、相談送信など）
                </li>
                <li>Cookie等を通じて取得されるアクセス情報</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800">3. 利用目的</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>診断結果の算出および表示のため</li>
                <li>無料相談へのご対応・ご連絡のため</li>
                <li>本サービスの利用状況の分析、品質改善、広告効果の測定のため</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800">4. 第三者提供</h2>
              <p className="mt-2">
                当社は、法令に基づく場合を除き、ご本人の同意なく取得した情報を第三者に提供することはありません。
                ただし、次条に記載する外部サービスへの情報送信はこの限りではありません。
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800">
                5. アクセス解析・広告計測ツールについて
              </h2>
              <p className="mt-2">
                本サービスでは、サービス改善および広告効果測定のため、Google
                Analytics（GA4）およびMeta
                Pixelを利用する場合があります。これらのツールはCookie等を使用してアクセス情報を収集します。
                収集された情報は各サービス提供者のプライバシーポリシーに基づいて管理されます。
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  Google Analyticsについて：
                  <a
                    className="text-blue-600 underline"
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Googleプライバシーポリシー
                  </a>
                </li>
                <li>
                  Meta Pixelについて：
                  <a
                    className="text-blue-600 underline"
                    href="https://www.facebook.com/privacy/policy/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Metaプライバシーポリシー
                  </a>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800">6. Cookieについて</h2>
              <p className="mt-2">
                本サービスは、診断の進捗状況の保持や上記アクセス解析のためにCookie・ブラウザのストレージ機能を使用します。
                ブラウザの設定によりCookieを無効化することも可能ですが、その場合一部機能が正しく動作しない場合があります。
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800">7. 情報の開示・訂正・削除</h2>
              <p className="mt-2">
                ご自身の情報の開示・訂正・削除をご希望の場合は、下記お問い合わせ先までご連絡ください。
                本人確認の上、合理的な範囲で対応いたします。
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800">8. お問い合わせ</h2>
              <p className="mt-2">
                本ポリシーに関するお問い合わせは、zxc552718@gmail.com までお願いいたします。
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800">9. 本ポリシーの変更</h2>
              <p className="mt-2">
                当社は、必要に応じて本ポリシーの内容を変更することがあります。変更後の内容は本ページに掲載した時点から効力を生じるものとします。
              </p>
            </section>
          </div>
        </Container>
      </div>
    </main>
  );
}
