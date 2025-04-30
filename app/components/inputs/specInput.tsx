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
import { Label } from "../ui/label";

export function SpecInput({
  config,
  form,
  label = "Spec",
}: {
  config: FieldMetadata<string>;
  form?: string;
  label?: string;
}) {
  const control = useInputControl(config);

  return (
    <div>
      <Label>{label}</Label>
      <Select
        form={form}
        name={config.name}
        value={config.value}
        onValueChange={control.change}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Class and Spec" />
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
    </div>
  );
}
