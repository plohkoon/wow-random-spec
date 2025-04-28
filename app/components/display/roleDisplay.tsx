export function RoleDisplay<C extends React.ElementType = "span">({
  as,
  playerRole,
  ...rest
}: {
  as?: C;
  playerRole: string | null;
} & Omit<React.ComponentPropsWithoutRef<C>, "children">) {
  const Component = as || "span";

  const roleText =
    {
      dps: "DPS",
      tank: "Tank",
      healer: "Healer",
    }[playerRole ?? ""] ?? playerRole;

  let className =
    "font-bold text-neutral-700 data-[role=dps]:text-dps data-[role=rdps]:text-dps data-[role=mdps]:text-dps data-[role=tank]:text-tank data-[role=healer]:text-healer data-[role=dps]:before:bg-[url('/dps.png')] data-[role=rdps]:before:bg-[url('/dps.png')] data-[role=mdps]:before:bg-[url('/dps.png')] data-[role=healer]:before:bg-[url('/healer.png')] data-[role=tank]:before:bg-[url('/tank.png')] before:w-5 before:h-5 before:bg-cover before:bg-center before:inline-block before:align-middle flex items-center gap-2";

  if ("className" in rest) {
    className += ` ${rest.className}`;
  }

  return (
    <Component {...rest} data-role={playerRole} className={className}>
      {roleText}
    </Component>
  );
}
