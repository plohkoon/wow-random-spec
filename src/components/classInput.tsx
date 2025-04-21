import { classes } from "../lib/classes";

export function ClassInput({
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
      name="class"
      onChange={onChange}
      defaultValue={defaultValue}
      form={form}
    >
      {classes.map((c) => (
        <option value={c}>{c}</option>
      ))}
    </select>
  );
}
