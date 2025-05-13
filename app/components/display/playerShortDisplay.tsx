import { getClassAndSpec } from "~/lib/classes";

export function PlayerShortDisplay<C extends React.ElementType = "span">({
  as,
  player,
  className,
  ...rest
}: {
  as?: C;
  player: {
    nickname: string;
    spec: string | null | undefined;
    assignedRole: string | null | undefined;
  };
} & Omit<React.ComponentPropsWithoutRef<C>, "children">) {
  const Component = as || "span";

  const allClassNames = [
    className,
    "text-neutral-700 data-[playerclass=druid]:text-druid data-[playerclass=hunter]:text-hunter data-[playerclass=mage]:text-mage data-[playerclass=monk]:text-monk data-[playerclass=paladin]:text-paladin data-[playerclass=priest]:text-priest data-[playerclass=rogue]:text-rogue data-[playerclass=shaman]:text-shaman data-[playerclass=warlock]:text-warlock data-[playerclass=warrior]:text-warrior data-[playerclass=deathKnight]:text-deathknight data-[playerclass=demonHunter]:text-demonhunter data-[playerclass=evoker]:text-evoker",
    "data-[role=dps]:before:bg-[url('/dps.png')] data-[role=rdps]:before:bg-[url('/dps.png')] data-[role=mdps]:before:bg-[url('/dps.png')] data-[role=healer]:before:bg-[url('/healer.png')] data-[role=healing]:before:bg-[url('/healer.png')] data-[role=tank]:before:bg-[url('/tank.png')] before:w-5 before:h-5 before:bg-cover before:bg-center before:inline-block before:align-middle flex items-center gap-2",
  ].join(" ");

  return (
    <Component
      className={allClassNames}
      data-playerclass={getClassAndSpec(player.spec)[0]}
      data-role={player.assignedRole}
      {...rest}
    >
      {player.nickname}
    </Component>
  );
}
