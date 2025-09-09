import { ButtonHTMLAttributes, ReactNode } from "react";

type Props = {
  children: ReactNode;
  variant?: "primary" | "outline";
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({ children, variant = "primary", className = "", ...rest }: Props) {
  const base =
    "inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold transition";
  const styles =
    variant === "primary"
      ? "bg-brand-red-600 text-white shadow hover:bg-brand-red-700"
      : "border border-brand-red-600 text-brand-red-600 hover:bg-red-50";

  return (
    <button {...rest} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
}
