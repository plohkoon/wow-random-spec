import { FieldMetadata, getInputProps } from "@conform-to/react";

export function CHiddenInput({
  config,
}: {
  config: FieldMetadata<string, Record<string, unknown>, string[]>;
}) {
  return (
    <div>
      <input {...getInputProps(config, { type: "hidden" })} />
    </div>
  );
}
