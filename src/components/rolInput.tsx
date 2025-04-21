import { roles } from "../lib/classes";

export function RoleInput({
  onChange,
  defaultValue,
  form,
}: {
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  form?: string;
  defaultValue?: string;
}) {
  return (
    <select
      name="role"
      onChange={onChange}
      defaultValue={defaultValue}
      form={form}
    >
      {roles.map((c) => (
        <option value={c}>{c}</option>
      ))}
    </select>
  );
}
