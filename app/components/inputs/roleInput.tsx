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
import { FieldMetadata, useInputControl } from "@conform-to/react";
import { Label } from "../ui/label";

export function RoleInput({
  config,
  form,
  label = "Role",
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
    </div>
  );
}
