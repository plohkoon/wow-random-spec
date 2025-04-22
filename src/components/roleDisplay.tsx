type Props<C extends React.ElementType> = {
  as?: C;
  role: string;
} & Omit<React.ComponentPropsWithoutRef<C>, "children">;

export function RoleDisplay<C extends React.ElementType = "span">({
  as,
  role,
  ...rest
}: Props<C>) {
  const Component = as || "span";

  return (
    <Component
      className="font-bold text-neutral-700 data-[role=dps]:text-red-900 data-[role=tank]:text-blue-900 data-[role=healer]:text-green-900 data-[role=dps]:before:bg-[url('/dps.png')] data-[role=healer]:before:bg-[url('/healer.png')] data-[role=tank]:before:bg-[url('/tank.png')] before:w-5 before:h-5 before:bg-cover before:bg-center before:inline-block before:align-middle flex items-center gap-2"
      {...rest}
      data-role={role}
    >
      {role}
    </Component>
  );
}
