import { PlayerType } from "./usePlayers";

export const classSpecs = {
  druid: {
    balance: "rdps",
    feral: "mdps",
    guardian: "tank",
    restoration: "healer",
  },
  hunter: {
    beastMastery: "rdps",
    marksmanship: "rdps",
    survival: "mdps",
  },
  mage: {
    arcane: "rdps",
    fire: "rdps",
    frost: "rdps",
  },
  monk: {
    brewMaster: "tank",
    mistweaver: "healer",
    windwalker: "mdps",
  },
  paladin: {
    holy: "healer",
    protection: "tank",
    retribution: "mdps",
  },
  priest: {
    discipline: "healer",
    holy: "healer",
    shadow: "rdps",
  },
  rogue: {
    assassination: "mdps",
    outlaw: "mdps",
    subtlety: "mdps",
  },
  shaman: {
    elemental: "rdps",
    enhancement: "mdps",
    restoration: "healer",
  },
  warlock: {
    affliction: "rdps",
    demonology: "rdps",
    destruction: "rdps",
  },
  warrior: {
    arms: "mdps",
    fury: "mdps",
    protection: "tank",
  },
  deathKnight: {
    blood: "tank",
    frost: "mdps",
    unholy: "mdps",
  },
  demonHunter: {
    havoc: "mdps",
    vengeance: "tank",
  },
  evoker: {
    preservation: "healer",
    devastation: "rdps",
    augmentation: "rdps",
  },
};

export const classes = Object.keys(classSpecs) as Array<
  keyof typeof classSpecs
>;
export const roles = ["tank", "healer", "rdps", "mdps"] as const;

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

export function availableSpecsForPlayer(
  player: PlayerType,
  forceRole?: string
) {
  return Object.keys(classSpecs)
    .filter((c) => c !== player.main)
    .flatMap((c) => {
      const specs = classSpecs[c as keyof typeof classSpecs];

      return Object.entries(specs)
        .filter(
          ([, r]) =>
            (forceRole === undefined ? r === player.role : r === forceRole) &&
            c !== player.main &&
            c !== player.rolledSpec
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
