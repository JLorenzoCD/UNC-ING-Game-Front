import type { ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export default function Button({
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={twMerge(
        "focus:outline-none text-white bg-[#2C2C2C] hover:bg-[#4D4D4D]",
        "focus:ring-4 focus:ring-[#4D4D4D] font-medium rounded-lg",
        "text-sm px-5 py-2.5 disabled:bg-[#6e6e6e]",
        "hover:disabled:bg-[#6e6e6e] disabled:cursor-not-allowed",
        className,
      )}
      {...rest}
    />
  );
}
