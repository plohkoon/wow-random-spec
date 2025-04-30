import { FieldMetadata, useInputControl } from "@conform-to/react";
import { classes } from "../../lib/classes";
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

export function ClassInput({
  config,
  form,
  label = "Class",
}: {
  config: FieldMetadata<string>;
  label?: string;
  form?: string;
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
          <SelectValue placeholder="Class" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup className="space-y-1">
            <SelectLabel>Classes</SelectLabel>
            {classes.map((c) => (
              <ClassDisplay
                as={SelectItem}
                value={c}
                key={c}
                classSpec={c}
                fillIn
              />
              // <SelectItem value={c} key={c}>
              // </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
