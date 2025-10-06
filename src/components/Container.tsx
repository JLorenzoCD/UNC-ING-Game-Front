import type { HTMLAttributes } from "react";

export default function Container({
  className = "",
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={`${className} container mx-auto`} {...rest} />;
}
