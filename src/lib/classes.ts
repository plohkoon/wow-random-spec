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
