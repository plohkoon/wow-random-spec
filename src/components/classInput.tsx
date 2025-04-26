import { classes } from "../lib/classes";
import { ClassDisplay } from "./classDisplay";
// import { ClassDisplay } from "./classDisplay";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function ClassInput({
  onChange,
  defaultValue,
  form,
}: {
  onChange?: (value: string) => void;
  form?: string;
  defaultValue?: string;
}) {
  return (
    <Select
      form={form}
      defaultValue={defaultValue}
      onValueChange={onChange}
      name="class"
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
