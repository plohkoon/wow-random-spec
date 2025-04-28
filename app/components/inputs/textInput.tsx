import { FieldMetadata, getInputProps } from "@conform-to/react";
import { ComponentProps } from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export function CTextInput({
  config,
  label,
  type = "text",
  ...rest
}: {
  config: FieldMetadata<string, Record<string, unknown>, string[]>;
  label: string;
  type?: "text" | "email" | "password" | "number" | "search" | "tel" | "url";
} & ComponentProps<typeof Input>) {
  return (
    <div>
      <Label htmlFor={config.id}>{label}</Label>
      <Input {...rest} {...getInputProps(config, { type })} />
      {config.errors?.length ? <div>{config.errors}</div> : null}
    </div>
  );
}
