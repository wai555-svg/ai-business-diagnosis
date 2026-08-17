import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-md items-center px-5 py-4">
        <Link href="/" className="text-sm font-bold tracking-wide text-slate-800">
          AI業務改善診断
        </Link>
      </div>
    </header>
  );
}
