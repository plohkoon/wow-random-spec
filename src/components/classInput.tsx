import { classes } from "../lib/classes";
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
        <SelectGroup>
          <SelectLabel>Classes</SelectLabel>
          {classes.map((c) => (
            // !GH - There's a white on white but with priests here.
            // <ClassDisplay as={SelectItem} value={c} key={c} playerClass={c} />
            <SelectItem value={c} key={c}>
              {c}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
