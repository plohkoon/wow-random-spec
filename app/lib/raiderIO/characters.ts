import type { RaiderIOClient } from ".";
import type { RootNS } from "./index";
import { fieldsString, HasChildBool } from "./utils";

export namespace CharacterNS
{
  export type CharacterPayloadBase = {
    name: string;
    race: RootNS.Race;
    class: RootNS.Class;
    active_spec_name: RootNS.Spec;
    active_spec_role: RootNS.Role;
    gender: string;
    faction: RootNS.Faction;
    achievement_points: number;
    thumbnail_url: string;
    region: RootNS.Region;
    realm: RootNS.Realm;
    last_crawled_at: RootNS.DateTime;
    profile_url: string;
    profile_banner: string;
  };

  interface GearSpell {
    id: number;
    school: number;
    icon: string;
    name: string;
    rank: string | null;
  }

  interface AzeritePower {
    id: number;
    spell: GearSpell;
    tier: number;
  }

  interface Corruption {
    added: number;
    resisted: number;
    total: number;
  }

  export interface Item {
    item_id: number;
    item_level: number;
    icon: string;
    name: string;
    item_quality: number;
    is_legendary: boolean;
    is_azerite_armor: boolean;
    azerite_powers: Array<AzeritePower | null>;
    corruption: Corruption;
    domination_shards: unknown[]; // currently empty—replace `unknown` when you know the shape
    tier: string;
    gems: unknown[]; // ditto
    enchants: unknown[];
    bonuses: number[];
  }

  type GearType = {
    created_at: RootNS.DateTime;
    updated_at: RootNS.DateTime;
    source: string;
    item_level_equipped: number;
    item_level_total: number;
    artifact_traits: number;
    corruption: {
      added: number;
      resisted: number;
      total: number;
      cloakRank: number;
      spells: unknown[];
    };
    items: {
      head: Item;
      neck: Item;
      shoulder: Item;
      back: Item;
      chest: Item;
      shirt: Item;
      wrist: Item;
      hands: Item;
      waist: Item;
      legs: Item;
      feet: Item;
      ring1: Item;
      ring2: Item;
      trinket1: Item;
      trinket2: Item;
      mainhand: Item;
      offhand: Item;
    };
  };

  interface LoadoutEntry {
    node: TalentNode;
    entryIndex: number;
    rank: number;
  }

  interface TalentNode {
    id: number;
    treeId: number;
    subTreeId: number;
    type: number;
    entries: TalentEntry[];
    important: boolean;
    posX: number;
    posY: number;
    row: number;
    col: number;
  }

  interface TalentEntry {
    id: number;
    traitDefinitionId: number;
    traitSubTreeId: number;
    type: number;
    maxRanks: number;
    spell: TalentSpell | null;
  }

  interface TalentSpell {
    id: number;
    name: string;
    icon: string;
    school: number;
    rank: string | null;
    hasCooldown: boolean;
  }

  type TalentType = {
    loadout_spec_id: number;
    loadout_text: string;
    loadout: LoadoutEntry[];
  };

  type GuildType = {
    name: string;
    realm: RootNS.Realm;
  };

  type CovenantType = unknown;

  type RaidType = {
    summary: string;
    expansion_id: number;
    total_bosses: number;
    normal_bosses_killed: number;
    heroic_bosses_killed: number;
    mythic_bosses_killed: number;
  };

  // Could maybe narrow this to "liberation-of-undermine" and stuff.
  type RaidProgressionType = {
    [key: RootNS.Raid]: RaidType;
  };

  type MythicPlusSegmentType = {
    score: number;
    color: string;
  };

  type MythicPlusScoresBySeasonType = {
    season: string;
    scores: {
      all: number;
      dps: number;
      healer: number;
      tank: number;
      dps_0: number;
      dps_1: number;
      dps_2: number;
      dps_3: number;
    };
    segments: {
      all: MythicPlusSegmentType;
      dps: MythicPlusSegmentType;
      healer: MythicPlusSegmentType;
      tank: MythicPlusSegmentType;
      dps_0: MythicPlusSegmentType;
      dps_1: MythicPlusSegmentType;
      dps_2: MythicPlusSegmentType;
      dps_3: MythicPlusSegmentType;
    };
  }[];

  type MythicPlusRankType = {
    world: number;
    region: number;
    realm: number;
  };

  type MythicPlusRanksType = {
    overall: MythicPlusRankType;
    dps?: MythicPlusRankType;
    healer?: MythicPlusRankType;
    tank?: MythicPlusRankType;
    class_tank?: MythicPlusRankType;
    class_dps?: MythicPlusRankType;
    class_healer?: MythicPlusRankType;
  } & Record<`spec_${number}`, MythicPlusRankType>;

  export interface MythicPlusRun {
    dungeon: string;
    short_name: string;
    mythic_level: number;
    completed_at: RootNS.DateTime; // ISO 8601 timestamp
    clear_time_ms: number;
    keystone_run_id: number;
    par_time_ms: number;
    num_keystone_upgrades: number;
    map_challenge_mode_id: number;
    zone_id: number;
    zone_expansion_id: number;
    icon_url: string;
    background_image_url: string;
    score: number;
    affixes: Affix[];
    url: string;
  }

  export interface Affix {
    id: number;
    name: string;
    description: string;
    icon: string;
    icon_url: string;
    wowhead_url: string;
  }

  type MythicPlusRecentRunsType = MythicPlusRun[];
  type MythicPlusBestRunsType = MythicPlusRun[];
  type MythicPlusAlternateRunsType = MythicPlusRun[];
  type MythicPlusHighestLevelRunsType = MythicPlusRun[];
  type MythicPlusWeeklyHighestLevelRunsType = MythicPlusRun[];
  type MythicPlusPreviousWeeklyHighestLevelRunsType = MythicPlusRun[];
  type PreviousMythicPlusRanksType = MythicPlusRanksType;
  // Both of these are unknown as nothing seemed to be returned.
  type RaidMetaAchievementType = unknown;
  type RaidAchievementCurveType = unknown;

  export type OptionalCharacterProfilePayloadFields = {
    gear?: GearType;
    talents?: TalentType;
    guild?: GuildType;
    covenant?: CovenantType;
    raid_progression?: RaidProgressionType;
    mythic_plus_scores_by_season?: MythicPlusScoresBySeasonType;
    mythic_plus_ranks?: MythicPlusRanksType;
    mythic_plus_recent_runs?: MythicPlusRecentRunsType;
    mythic_plus_best_runs?: MythicPlusBestRunsType;
    mythic_plus_alternate_runs?: MythicPlusAlternateRunsType;
    mythic_plus_highest_level_runs?: MythicPlusHighestLevelRunsType;
    mythic_plus_weekly_highest_level_runs?: MythicPlusWeeklyHighestLevelRunsType;
    mythic_plus_previous_weekly_highest_level_runs?: MythicPlusPreviousWeeklyHighestLevelRunsType;
    previous_mythic_plus_ranks?: PreviousMythicPlusRanksType;
    raid_achievement_meta?: RaidMetaAchievementType;
    raid_achievement_curve?: RaidAchievementCurveType;
  };

  // This entire hash is just for the fact that talents does not match the output key.
  // As far as I can tell every other key matches the key in the output.
  type OutputKey = {
    gear: "gear";
    talents: "talentLoadout";
    guild: "guild";
    covenant: "covenant";
    raid_progression: "raid_progression";
    mythic_plus_scores_by_season: "mythic_plus_scores_by_season";
    mythic_plus_ranks: "mythic_plus_ranks";
    mythic_plus_recent_runs: "mythic_plus_recent_runs";
    mythic_plus_best_runs: "mythic_plus_best_runs";
    mythic_plus_alternate_runs: "mythic_plus_alternate_runs";
    mythic_plus_highest_level_runs: "mythic_plus_highest_level_runs";
    mythic_plus_weekly_highest_level_runs: "mythic_plus_weekly_highest_level_runs";
    mythic_plus_previous_weekly_highest_level_runs: "mythic_plus_previous_weekly_highest_level_runs";
    previous_mythic_plus_ranks: "previous_mythic_plus_ranks";
    raid_achievement_meta: "raid_achievement_meta";
    raid_achievement_curve: "raid_achievement_curve";
  };

  export type OptionalCharacterProfilePayloadOptions = {
    gear?: boolean;
    talents?:
        | boolean
        | {
      categorized: true;
    };
    guild?: boolean;
    covenant?: boolean;
    raid_progression?:
        | boolean
        | {
      [
          key:
              | string
              | number
              | "current-expansion"
              | "previous-expansion"
              | "current-tier"
              | "previous-tier"
          ]: boolean;
    };
    mythic_plus_scores_by_season?:
        | boolean
        | {
      [key: "current" | "previous" | `season-${string}` | string]: boolean;
    };
    mythic_plus_ranks?: boolean;
    mythic_plus_recent_runs?: boolean;
    mythic_plus_best_runs?:
        | boolean
        | {
      all: boolean;
    };
    mythic_plus_alternate_runs?:
        | boolean
        | {
      all: boolean;
    };
    mythic_plus_highest_level_runs?: boolean;
    mythic_plus_weekly_highest_level_runs?: boolean;
    mythic_plus_previous_weekly_highest_level_runs?: boolean;
    previous_mythic_plus_ranks?: boolean;
    raid_achievement_meta?: {
      [key: `tier${number}`]: boolean;
    };
    raid_achievement_curve?: {
      [key: `tier${number}`]: boolean;
    };
  };

  // Build up the output hash with only the keys that are requested.
  export type CharacterProfilePayload<
      T extends OptionalCharacterProfilePayloadOptions
  > = CharacterPayloadBase & {
    [key in keyof OptionalCharacterProfilePayloadFields as HasChildBool<
        T[key]
    > extends true
        ? OutputKey[key]
        : never]: OptionalCharacterProfilePayloadFields[key];
  };
};

export class Character {
  private client: RaiderIOClient;

  constructor(client: RaiderIOClient) {
    this.client = client;
  }

  async getCharacterProfile<
    T extends CharacterNS.OptionalCharacterProfilePayloadOptions
  >({
    region,
    realm,
    name,
    fields,
  }: {
    region: string;
    realm: string;
    name: string;
    fields?: T;
  }): Promise<CharacterNS.CharacterProfilePayload<T>> {
    return this.client.get("/characters/profile", {
      params: {
        region,
        realm,
        name,
        ...fieldsString(fields),
      },
    }) as any;
  }

  async getCharacterProfiles<
    T extends CharacterNS.OptionalCharacterProfilePayloadOptions
  >({
    characters,
  }: {
    characters: {
      region: string;
      realm: string;
      name: string;
      fields?: T;
    }[];
  }): Promise<CharacterNS.CharacterProfilePayload<T>[]> {
    return Promise.all(
      characters.map((character) => this.getCharacterProfile(character))
    );
  }
}
