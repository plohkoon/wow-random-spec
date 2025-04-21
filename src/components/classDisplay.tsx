import { keyToNameMapping } from "@/lib/classes";

type Props<C extends React.ElementType> = {
  as?: C;
  playerClass: string;
  spec?: string;
  fillIn?: boolean;
} & Omit<React.ComponentPropsWithoutRef<C>, "children">;

const BASE_CLASSNAMES =
  "font-bold bg-neutral-200 text-neutral-700 data-[fillIn=true]:text-neutral-200 data-[fillIn=true]:bg-neutral-700";
const DRUID_CLASSNAMES =
  "data-[playerClass=druid]:data-[fillIn=false]:text-druid data-[playerClass=druid]:data-[fillIn=true]:bg-druid";
const HUNTER_CLASSNAMES =
  "data-[playerClass=hunter]:data-[fillIn=false]:text-hunter data-[playerClass=hunter]:data-[fillIn=true]:bg-hunter  data-[playerClass=hunter]:data-[fillIn=true]:text-neutral-500";
const MAGE_CLASSNAMES =
  "data-[playerClass=mage]:data-[fillIn=false]:text-mage data-[playerClass=mage]:data-[fillIn=true]:bg-mage data-[playerClass=mage]:data-[fillIn=true]:text-neutral-500";
const MONK_CLASSNAMES =
  "data-[playerClass=monk]:data-[fillIn=false]:text-monk data-[playerClass=monk]:data-[fillIn=true]:bg-monk data-[playerClass=monk]:data-[fillIn=true]:text-neutral-500";
const PALADIN_CLASSNAMES =
  "data-[playerClass=paladin]:data-[fillIn=false]:text-paladin data-[playerClass=paladin]:data-[fillIn=true]:bg-paladin data-[playerClass=paladin]:data-[fillIn=true]:text-neutral-500";
const PRIEST_CLASSNAMES =
  "data-[playerClass=priest]:data-[fillIn=false]:text-priest data-[playerClass=priest]:data-[fillIn=true]:bg-priest data-[playerClass=priest]:data-[fillIn=true]:text-neutral-500";
const ROGUE_CLASSNAMES =
  "data-[playerClass=rogue]:data-[fillIn=false]:text-rogue data-[playerClass=rogue]:data-[fillIn=true]:bg-rogue data-[playerClass=rogue]:data-[fillIn=true]:text-neutral-500";
const SHAMAN_CLASSNAMES =
  "data-[playerClass=shaman]:data-[fillIn=false]:text-shaman data-[playerClass=shaman]:data-[fillIn=true]:bg-shaman";
const WARLOCK_CLASSNAMES =
  "data-[playerClass=warlock]:data-[fillIn=false]:text-warlock data-[playerClass=warlock]:data-[fillIn=true]:bg-warlock";
const WARRIOR_CLASSNAMES =
  "data-[playerClass=warrior]:data-[fillIn=false]:text-warrior data-[playerClass=warrior]:data-[fillIn=true]:bg-warrior";
const DEATHKNIGHT_CLASSNAMES =
  "data-[playerClass=deathKnight]:data-[fillIn=false]:text-deathknight data-[playerClass=deathKnight]:data-[fillIn=true]:bg-deathknight";
const DEMONHUNTER_CLASSNAMES =
  "data-[playerClass=demonHunter]:data-[fillIn=false]:text-demonHunter data-[playerClass=demonHunter]:data-[fillIn=true]:bg-demonHunter";
const EVOKER_CLASSNAMES =
  "data-[playerClass=evoker]:data-[fillIn=false]:text-evoker data-[playerClass=evoker]:data-[fillIn=true]:bg-evoker";

const CLASSNAMES = [
  BASE_CLASSNAMES,
  DRUID_CLASSNAMES,
  HUNTER_CLASSNAMES,
  MAGE_CLASSNAMES,
  MONK_CLASSNAMES,
  PALADIN_CLASSNAMES,
  PRIEST_CLASSNAMES,
  ROGUE_CLASSNAMES,
  SHAMAN_CLASSNAMES,
  WARLOCK_CLASSNAMES,
  WARRIOR_CLASSNAMES,
  DEATHKNIGHT_CLASSNAMES,
  DEMONHUNTER_CLASSNAMES,
  EVOKER_CLASSNAMES,
].join(" ");

export function ClassDisplay<C extends React.ElementType = "span">({
  as,
  playerClass,
  spec,
  fillIn = false,
  ...rest
}: Props<C>) {
  const Component = as || "span";

  let className = CLASSNAMES;

  if ("className" in rest) {
    className = `${rest.className} ${className}`;
  }

  const classText: string =
    playerClass in keyToNameMapping
      ? // @ts-expect-error: This is fine, TS just isn't following
        keyToNameMapping[playerClass]
      : playerClass;
  const specText = spec ? `${spec}` : "";

  return (
    <Component
      {...rest}
      className={className}
      data-playerClass={playerClass}
      data-spec={spec}
      data-fillIn={fillIn}
    >
      {classText}
      {spec && <span className="text-xs font-normal">{` (${specText})`}</span>}
    </Component>
  );
}
