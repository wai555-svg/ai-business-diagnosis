import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean;
};

export default function PrimaryButton({ fullWidth = true, className = "", children, ...rest }: Props) {
  return (
    <button
      className={`${fullWidth ? "w-full" : ""} inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-blue-600/20 transition active:scale-[0.98] hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
