import type { HTMLAttributes } from "react";

function Container({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`${className} container mx-auto`} {...rest} />;
}

export default Container;
