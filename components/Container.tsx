import type { ReactNode } from "react";

export default function Container({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-md px-5">{children}</div>;
}
