import { PlayerType } from "./usePlayers";

export const classSpecs = {
  druid: {
    balance: "dps",
    feral: "dps",
    guardian: "tank",
    restoration: "healer",
  },
  hunter: {
    beastMastery: "dps",
    marksmanship: "dps",
    survival: "dps",
  },
  mage: {
    arcane: "dps",
    fire: "dps",
    frost: "dps",
  },
  monk: {
    brewMaster: "tank",
    mistweaver: "healer",
    windwalker: "dps",
  },
  paladin: {
    holy: "healer",
    protection: "tank",
    retribution: "dps",
  },
  priest: {
    discipline: "healer",
    holy: "healer",
    shadow: "dps",
  },
  rogue: {
    assassination: "dps",
    outlaw: "dps",
    subtlety: "dps",
  },
  shaman: {
    elemental: "dps",
    enhancement: "dps",
    restoration: "healer",
  },
  warlock: {
    affliction: "dps",
    demonology: "dps",
    destruction: "dps",
  },
  warrior: {
    arms: "dps",
    fury: "dps",
    protection: "tank",
  },
  deathKnight: {
    blood: "tank",
    frost: "dps",
    unholy: "dps",
  },
  demonHunter: {
    havoc: "dps",
    vengeance: "tank",
  },
  evoker: {
    preservation: "healer",
    devastation: "dps",
    augmentation: "dps",
  },
};

export const classes = Object.keys(classSpecs) as Array<
  keyof typeof classSpecs
>;
export const roles = ["tank", "healer", "dps"] as const;

export const keyToNameMapping = {
  druid: "Druid",
  hunter: "Hunter",
  mage: "Mage",
  monk: "Monk",
  paladin: "Paladin",
  priest: "Priest",
  rogue: "Rogue",
  shaman: "Shaman",
  warlock: "Warlock",
  warrior: "Warrior",
  deathKnight: "Death Knight",
  demonHunter: "Demon Hunter",
  evoker: "Evoker",
};

export function availableSpecsForPlayer(player: PlayerType, onlyRole?: string) {
  return Object.keys(classSpecs)
    .filter((c) => c !== player.main)
    .flatMap((c) => {
      const specs = classSpecs[c as keyof typeof classSpecs];

      return Object.entries(specs)
        .filter(
          ([s, r]) =>
            (onlyRole === undefined ? r !== player.role : r === onlyRole) &&
            s !== player.rolledSpec
        )
        .map(([s]) => makeClassSpec(c, s));
    });
}

export function getClassAndSpec(
  classSpec?: string | undefined
): [string, string | undefined] {
  if (!classSpec) return ["", undefined];

  const [c, s] = classSpec.split("-");

  return [c, s];
}

export function makeClassSpec(playerClass: string, spec?: string): string {
  if (!spec) {
    return playerClass;
  } else {
    return `${playerClass}-${spec}`;
  }
}
