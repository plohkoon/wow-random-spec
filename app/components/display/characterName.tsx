type Props<C extends React.ElementType> = {
  as?: C;
  name: string | null;
  server: string | null;
  region?: string | null;
} & Omit<React.ComponentPropsWithoutRef<C>, "children">;

export function CharacterName<C extends React.ElementType = "span">({
  as,
  name,
  server,
  region,
  ...rest
}: Props<C>) {
  const Component = as || "span";

  return (
    <Component {...rest}>
      {name ? name : "no name"}
      {server && <span className="text-xs text-neutral-500"> - {server}</span>}
      {region && (
        <span className="text-xs text-neutral-500">
          {" "}
          - {region.toUpperCase()}
        </span>
      )}
    </Component>
  );
}
