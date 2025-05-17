function formatLabel(input: string) {
  return input
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^\w/, c => c.toUpperCase()); 
}

export function SpecDisplay<C extends React.ElementType = "span">({
  as,
  spec,
  ...rest
}: {
  as?: C;
  spec: string | null;
} & Omit<React.ComponentPropsWithoutRef<C>, "children">) {
  const Component = as || "span";

  if (!spec || !spec.includes("-")) return null;

  const [classKey, specKey] = spec.split("-");

  const classLabel = formatLabel(classKey);
  const specLabel = formatLabel(specKey);

  const classColors: Record<string, string> = {
    warrior: "#C79C6E",
    paladin: "#F58CBA",
    hunter: "#ABD473",
    rogue: "#FFF569",
    priest: "#FFFFFF",
    deathknight: "#C41F3B",
    shaman: "#0070DE",
    mage: "#69CCF0",
    warlock: "#9482C9",
    monk: "#00FF96",
    druid: "#FF7D0A",
    demonhunter: "#A330C9",
    evoker: "#33937F",
  };

  const color = classColors[classKey.toLowerCase()] ?? "#AAAAAA";

  return (
    <Component
      {...rest}
      className={`font-bold ${rest.className ?? ""}`}
      style={{ color }}
    >
      {specLabel} ({classLabel})
    </Component>
  );
}
