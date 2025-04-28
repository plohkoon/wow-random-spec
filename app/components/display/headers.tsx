import clsx from "clsx";
import { ComponentProps } from "react";

export function H1(props: ComponentProps<"h1">) {
  return (
    <h1 {...props} className={clsx("text-4xl font-bold", props.className)}>
      {props.children}
    </h1>
  );
}

export function H2(props: ComponentProps<"h2">) {
  return (
    <h2 {...props} className={clsx("text-3xl font-bold", props.className)}>
      {props.children}
    </h2>
  );
}

export function H3(props: ComponentProps<"h3">) {
  return (
    <h3 {...props} className={clsx("text-2xl font-bold", props.className)}>
      {props.children}
    </h3>
  );
}

export function H4(props: ComponentProps<"h4">) {
  return (
    <h4 {...props} className={clsx("text-xl font-bold", props.className)}>
      {props.children}
    </h4>
  );
}

export function H5(props: ComponentProps<"h5">) {
  return (
    <h5 {...props} className={clsx("text-lg font-bold", props.className)}>
      {props.children}
    </h5>
  );
}

export function H6(props: ComponentProps<"h6">) {
  return (
    <h6 {...props} className={clsx("text-base font-bold", props.className)}>
      {props.children}
    </h6>
  );
}
