import { getClassAndSpec, keyToNameMapping } from "@/lib/classes";

type Props<C extends React.ElementType> = {
  as?: C;
  classSpec: string | undefined;
  fillIn?: boolean;
} & Omit<React.ComponentPropsWithoutRef<C>, "children">;

const BASE_CLASSNAMES =
  "font-bold text-neutral-700 data-[fillin=true]:text-neutral-200 data-[fillin=true]:bg-neutral-700 text-shadow-sm text-shadow-neutral-300";
const DRUID_CLASSNAMES =
  "data-[playerclass=druid]:data-[fillin=false]:text-druid data-[playerclass=druid]:data-[fillin=true]:bg-druid";
const HUNTER_CLASSNAMES =
  "data-[playerclass=hunter]:data-[fillin=false]:text-hunter data-[playerclass=hunter]:data-[fillin=true]:bg-hunter  data-[playerclass=hunter]:data-[fillin=true]:text-neutral-500";
const MAGE_CLASSNAMES =
  "data-[playerclass=mage]:data-[fillin=false]:text-mage data-[playerclass=mage]:data-[fillin=true]:bg-mage data-[playerclass=mage]:data-[fillin=true]:text-neutral-500 data-[playerclass=mage]:text-shadow-neutral-500";
const MONK_CLASSNAMES =
  "data-[playerclass=monk]:data-[fillin=false]:text-monk data-[playerclass=monk]:data-[fillin=true]:bg-monk data-[playerclass=monk]:data-[fillin=true]:text-neutral-500 data-[playerclass=monk]:text-shadow-neutral-500";
const PALADIN_CLASSNAMES =
  "data-[playerclass=paladin]:data-[fillin=false]:text-paladin data-[playerclass=paladin]:data-[fillin=true]:bg-paladin data-[playerclass=paladin]:data-[fillin=true]:text-neutral-500 data-[playerclass=paladin]:text-shadow-neutral-500";
const PRIEST_CLASSNAMES =
  "data-[playerclass=priest]:data-[fillin=false]:text-priest data-[playerclass=priest]:data-[fillin=true]:bg-priest data-[playerclass=priest]:data-[fillin=true]:text-neutral-500 data-[playerclass=priest]:text-shadow-neutral-500";
const ROGUE_CLASSNAMES =
  "data-[playerclass=rogue]:data-[fillin=false]:text-rogue data-[playerclass=rogue]:data-[fillin=true]:bg-rogue data-[playerclass=rogue]:data-[fillin=true]:text-neutral-500 data-[playerclass=rogue]:text-shadow-neutral-500";
const SHAMAN_CLASSNAMES =
  "data-[playerclass=shaman]:data-[fillin=false]:text-shaman data-[playerclass=shaman]:data-[fillin=true]:bg-shaman";
const WARLOCK_CLASSNAMES =
  "data-[playerclass=warlock]:data-[fillin=false]:text-warlock data-[playerclass=warlock]:data-[fillin=true]:bg-warlock";
const WARRIOR_CLASSNAMES =
  "data-[playerclass=warrior]:data-[fillin=false]:text-warrior data-[playerclass=warrior]:data-[fillin=true]:bg-warrior";
const DEATHKNIGHT_CLASSNAMES =
  "data-[playerclass=deathKnight]:data-[fillin=false]:text-deathknight data-[playerclass=deathKnight]:data-[fillin=true]:bg-deathknight";
const DEMONHUNTER_CLASSNAMES =
  "data-[playerclass=demonHunter]:data-[fillin=false]:text-demonHunter data-[playerclass=demonHunter]:data-[fillin=true]:bg-demonHunter data-[playerclass=demonHunter]:text-shadow-neutral-100";
const EVOKER_CLASSNAMES =
  "data-[playerclass=evoker]:data-[fillin=false]:text-evoker data-[playerclass=evoker]:data-[fillin=true]:bg-evoker";

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
  classSpec,
  fillIn = false,
  ...rest
}: Props<C>) {
  const Component = as || "span";

  const [playerClass, spec] = getClassAndSpec(classSpec);

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
      data-playerclass={playerClass}
      data-spec={spec}
      data-fillin={fillIn}
    >
      {classText}
      {spec && (
        <span className="text-xs font-normal ml-1">{` (${specText})`}</span>
      )}
    </Component>
  );
}
