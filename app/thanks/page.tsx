"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Container from "@/components/Container";
import Header from "@/components/Header";
import { loadContact, type ContactForm } from "@/lib/contactStorage";

export default function ThanksPage() {
  const [contact, setContact] = useState<ContactForm | null>(null);

  useEffect(() => {
    setContact(loadContact());
  }, []);

  return (
    <main className="flex flex-1 flex-col bg-slate-50">
      <Header />
      <div className="flex flex-1 items-center py-12">
        <Container>
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-100">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
              ✅
            </div>
            <h1 className="mt-5 text-xl font-bold text-slate-900">
              無料相談のお申し込み
              <br />
              ありがとうございます
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              担当者より2営業日以内にご連絡いたします。
              <br />
              今しばらくお待ちください。
            </p>

            {contact && (
              <div className="mt-6 rounded-xl bg-slate-50 p-4 text-left text-sm text-slate-600">
                <p className="font-bold text-slate-700">ご入力内容</p>
                <p className="mt-2">会社名：{contact.companyName}</p>
                <p>氏名：{contact.name}</p>
                <p>メール：{contact.email}</p>
                {contact.message && <p>相談内容：{contact.message}</p>}
              </div>
            )}

            <Link
              href="/"
              className="mt-8 inline-block text-sm font-bold text-blue-600 underline"
            >
              トップページへ戻る
            </Link>
          </div>
        </Container>
      </div>
    </main>
  );
}
