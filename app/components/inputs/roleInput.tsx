import { roles } from "~/lib/classes";
import { RoleDisplay } from "~/components/display/roleDisplay";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export function RoleInput({
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
      name="role"
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Role" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Roles</SelectLabel>
          {roles.map((r) => (
            <RoleDisplay as={SelectItem} value={r} key={r} playerRole={r} />
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
