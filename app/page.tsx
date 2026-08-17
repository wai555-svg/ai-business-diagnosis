import Link from "next/link";
import Container from "@/components/Container";

const POINTS = [
  { emoji: "⏱️", text: "10問・約3分でカンタン診断" },
  { emoji: "📊", text: "削減できる時間とコストを自動算出" },
  { emoji: "🎯", text: "AI化すべき業務トップ3がわかる" },
];

export default function TopPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white pb-10 pt-12">
        <div className="pointer-events-none absolute -top-24 right-[-80px] h-64 w-64 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="pointer-events-none absolute top-40 left-[-60px] h-56 w-56 rounded-full bg-indigo-200/30 blur-3xl" />

        <Container>
          <div className="relative">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
              無料・登録不要 / 中小企業向けAI診断
            </span>

            <h1 className="mt-5 text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
              御社では、AIで
              <br />
              <span className="text-blue-600">年間何時間</span>
              削減できる？
            </h1>

            <p className="mt-4 text-base leading-relaxed text-slate-600">
              10問・約3分で、AI導入による
              <br />
              業務削減効果を無料診断
            </p>

            <div className="mt-8">
              <Link href="/diagnosis">
                <button className="w-full rounded-xl bg-blue-600 px-6 py-5 text-lg font-bold text-white shadow-xl shadow-blue-600/30 transition active:scale-[0.98] hover:bg-blue-700">
                  無料で診断する
                </button>
              </Link>
              <p className="mt-3 text-center text-xs text-slate-400">
                しつこい営業はいたしません。診断のみでもOKです。
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-slate-100 bg-white py-10">
        <Container>
          <ul className="space-y-4">
            {POINTS.map((p) => (
              <li
                key={p.text}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4"
              >
                <span className="text-2xl">{p.emoji}</span>
                <span className="text-sm font-semibold text-slate-700">{p.text}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-slate-900 py-10">
        <Container>
          <h2 className="text-lg font-bold text-white">こんなお悩みありませんか？</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li className="flex gap-2">
              <span className="text-blue-400">・</span>
              ChatGPTには興味があるが、何から始めればいいかわからない
            </li>
            <li className="flex gap-2">
              <span className="text-blue-400">・</span>
              資料作成や議事録作成に社員の時間が取られている
            </li>
            <li className="flex gap-2">
              <span className="text-blue-400">・</span>
              自社でAI化できる業務がどこにあるのか分からない
            </li>
          </ul>
        </Container>
      </section>

      <section className="bg-white py-12">
        <Container>
          <div className="rounded-2xl border border-blue-100 bg-blue-50 px-6 py-8 text-center">
            <p className="text-sm font-bold text-blue-700">
              まずは自社の「削減できる時間」を
              <br />
              知ることから始めましょう
            </p>
            <div className="mt-6">
              <Link href="/diagnosis">
                <button className="w-full rounded-xl bg-blue-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-blue-600/20 transition active:scale-[0.98] hover:bg-blue-700">
                  無料で診断する
                </button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <footer className="mt-auto border-t border-slate-100 bg-white py-6">
        <Container>
          <p className="text-center text-xs text-slate-400">
            <Link href="/privacy" className="underline">
              プライバシーポリシー
            </Link>
          </p>
          <p className="mt-2 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} AI業務改善診断
          </p>
        </Container>
      </footer>
    </main>
  );
}
