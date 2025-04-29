import { FieldMetadata, useInputControl } from "@conform-to/react";
import { allClassSpecs } from "../../lib/classes";
import { ClassDisplay } from "../display/classDisplay";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export function SpecInput({
  config,
  form,
}: {
  config: FieldMetadata<string>;
  form?: string;
}) {
  const control = useInputControl(config);

  return (
    <Select
      form={form}
      name={config.name}
      value={config.value}
      onValueChange={control.change}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Class" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup className="space-y-1">
          <SelectLabel>Classes</SelectLabel>
          {allClassSpecs.map((c) => (
            <ClassDisplay
              as={SelectItem}
              value={c}
              key={c}
              classSpec={c}
              fillIn
            />
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
