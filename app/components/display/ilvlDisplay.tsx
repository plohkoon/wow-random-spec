import clsx from "clsx";

export function IlvlDisplay<C extends React.ElementType = "span">({
  as,
  ilvl,
  className,
  ...rest
}: {
  as?: C;
  ilvl: number;
  className?: string;
} & Omit<React.ComponentPropsWithoutRef<C>, "children">) {
  const Component = as || "span";

  const tier = Math.max(Math.floor((ilvl - 619) / 12), 0);

  return (
    <Component
      data-tier={tier}
      className={clsx(
        className,
        "data-[tier=1]:text-common data-[tier=2]:text-rare data-[tier=3]:text-epic data-[tier=4]:text-legendary"
      )}
      {...rest}
    >
      {ilvl}
    </Component>
  );
}
