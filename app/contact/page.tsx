"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/Container";
import Header from "@/components/Header";
import PrimaryButton from "@/components/PrimaryButton";
import { saveContact } from "@/lib/contactStorage";

export default function ContactPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isValid = companyName.trim() !== "" && name.trim() !== "" && /\S+@\S+\.\S+/.test(email);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isValid || submitting) return;
    setSubmitting(true);

    const form = { companyName, name, email, message };
    // MVPでは外部送信は行わず、入力内容をログ出力・ブラウザ保持のみ行う
    console.log("[無料相談お申し込み]", form);
    saveContact(form);

    router.push("/thanks");
  };

  return (
    <main className="flex flex-1 flex-col bg-slate-50">
      <Header />
      <div className="py-8">
        <Container>
          <h1 className="text-xl font-bold text-slate-900">無料相談のお申し込み</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            御社で実際にAI化できる業務を、無料で3つご提案いたします。
            <br />
            以下のフォームにご記入ください。
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="mb-1 block text-sm font-bold text-slate-700">
                会社名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="例：株式会社サンプル"
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-base outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-slate-700">
                氏名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例：山田 太郎"
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-base outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-slate-700">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="例：taro@example.com"
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-base outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-slate-700">相談したい内容</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="例：議事録作成をAI化したい"
                className="w-full resize-none rounded-xl border-2 border-slate-200 px-4 py-3 text-base outline-none focus:border-blue-500"
              />
            </div>

            <PrimaryButton type="submit" disabled={!isValid || submitting}>
              {submitting ? "送信中..." : "無料相談を申し込む"}
            </PrimaryButton>
          </form>
        </Container>
      </div>
    </main>
  );
}
