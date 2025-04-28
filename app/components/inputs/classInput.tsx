import { FieldMetadata, useInputControl } from "@conform-to/react";
import { classes } from "../../lib/classes";
import { ClassDisplay } from "../display/classDisplay";
// import { ClassDisplay } from "./classDisplay";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export function ClassInput({
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
  );
}
