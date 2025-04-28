import { FormMetadata, getFormProps } from "@conform-to/react";
import { ComponentProps } from "react";
import { Form, useFetcher } from "react-router";

type Props<T extends Record<string, unknown>> = ComponentProps<typeof Form> & {
  config: FormMetadata<T, string[]>;
  fetcher?: ReturnType<typeof useFetcher>;
};

export function CForm<T extends Record<string, unknown>>({
  config,
  fetcher,
  ...rest
}: Props<T>) {
  const FormComponent = fetcher ? fetcher.Form : Form;

  return <FormComponent {...getFormProps(config)} {...rest} />;
}
