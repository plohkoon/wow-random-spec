import type { RaiderIOClient, RootNS } from ".";
import { fieldsString, HasChildBool } from "./utils";

export namespace GuildNS {
  export interface Character {
    id: number;
    name: string;
    race: Race;
    class: CharacterClass;
    spec: Spec;
    talentLoadout: TalentLoadout;
    gender: string;
    thumbnail: string;
    itemLevelEquipped: number;
    artifactTraits: number;
    realm: Realm;
    region: Region;
    items: CharacterItems;
    interestingAuras: Spell[];
    recruitmentProfiles: any[]; // empty array in sample
  }

  export interface Race {
    id: number;
    name: string;
    slug: string;
    faction: string;
  }

  export interface CharacterClass {
    id: number;
    name: string;
    slug: string;
  }

  export interface Spec {
    id: number;
    name: string;
    slug: string;
    class_id: number;
    role: string;
    is_melee: boolean;
    patch: string;
    ordinal: number;
  }

  export interface TalentLoadout {
    specId: number;
    heroSubTreeId: number;
    loadout: LoadoutEntry[];
    loadoutText: string;
  }

  export interface LoadoutEntry {
    node: Node;
    entryIndex: number;
    rank: number;
  }

  export interface Node {
    id: number;
    treeId: number;
    subTreeId: number;
    type: number;
    entries: Entry[];
    important: boolean;
    posX: number;
    posY: number;
    row: number;
    col: number;
  }

  export interface Entry {
    id: number;
    traitDefinitionId: number;
    traitSubTreeId: number;
    type: number;
    maxRanks: number;
    spell: Spell | null;
  }

  export interface Spell {
    id: number;
    name: string;
    icon: string;
    school: number;
    rank: string | null;
    hasCooldown: boolean;
  }

  export interface Realm {
    id: number;
    connectedRealmId: number;
    wowRealmId: number;
    wowConnectedRealmId: number;
    name: string;
    altName: string | null;
    slug: string;
    altSlug: string;
    locale: string;
    isConnected: boolean;
    realmType: string;
  }

  export interface Region {
    name: string;
    slug: string;
    short_name: string;
  }

  export interface CharacterItems {
    created_at: string; // ISO 8601 timestamp
    updated_at: string; // ISO 8601 timestamp
    source: string;
    item_level_equipped: number;
    item_level_total: number;
    artifact_traits: number;
    corruption: CorruptionExtended;
    items: Record<string, EquippedItem>;
  }

  export interface CorruptionExtended {
    added: number;
    resisted: number;
    total: number;
    cloakRank: number;
    spells: any[]; // empty array in sample
  }

  export interface EquippedItem {
    item_id: number;
    item_level: number;
    icon: string;
    name: string;
    item_quality: number;
    is_legendary: boolean;
    is_azerite_armor: boolean;
    azerite_powers: Array<AzeritePower | null>;
    corruption: Corruption;
    domination_shards: any[];
    tier?: string;
    enchant?: number;
    gems: number[];
    enchants: number[];
    bonuses: number[];
  }

  export interface AzeritePower {
    id: number;
    spell: Spell;
    tier: number;
  }

  export interface Corruption {
    added: number;
    resisted: number;
    total: number;
  }

  export type BossKillPayload = {
    kill: {
      pulledAt: RootNS.DateTime;
      defeatedAt: RootNS.DateTime;
      durationMs: number;
      isSuccess: boolean;
      itemLevelEquippedAvg: number;
      itemLevelEquippedMax: number;
      itemLevelEquippedMin: number;
    };
    roster: {
      character: Character;
      vantus: boolean;
    }[];
  };

  type MemberCharacter = {
    name: string;
    race: string;
    active_spec_name: string;
    active_spec_role: string;
    gender: string;
    faction: string;
    achievement_points: number;
    region: RootNS.Region;
    realm: RootNS.Realm;
    last_crawled_at: RootNS.DateTime;
    profile_url: string;
    profile_banner: string;
  };

  type Member = {
    rank: number;
    character: MemberCharacter;
  };

  export type ProfileFieldOptions = {
    raid_progression?:
      | boolean
      | {
          [
            otherKey:
              | number
              | string
              | "current-expansion"
              | "previous-expansion"
              | "current-tier"
              | "previous-tier"
          ]: boolean;
        };
    raid_rankings?:
      | boolean
      | {
          [
            otherKey:
              | number
              | string
              | "current-expansion"
              | "previous-expansion"
              | "current-tier"
              | "previous-tier"
          ]: boolean;
        };
    members?: boolean;
    raid_encounters?: {
      [raidName: string]: {
        [difficulty: string]: boolean;
      };
    };
  };

  type RaidEncounterType = {
    slug: string;
    name: string;
    defeatedAt: RootNS.DateTime;
  };

  type RaidProgressionType = {
    summary: string;
    expansion_id: number;
    total_bosses: number;
    normal_bosses_killed: number;
    heroic_bosses_killed: number;
    mythic_bosses_killed: number;
  };

  type RaidRankingType = {
    normal: {
      world: number;
      region: number;
      realm: number;
    };
    heroic: {
      world: number;
      region: number;
      realm: number;
    };
    mythic: {
      world: number;
      region: number;
      realm: number;
    };
  };

  type OptionalGuildProfilePayloadFields = {
    members: Member[];
    raid_progression: Record<RootNS.Raid, RaidProgressionType>;
    raid_rankings: Record<RootNS.Raid, RaidRankingType>;
    raid_encounters: RaidEncounterType[];
  };

  type ProfilePayloadBase = {
    name: string;
    faction: string;
    region: RootNS.Region;
    realm: RootNS.Realm;
    last_crawled_at: RootNS.DateTime;
    profile_url: string;
  };

  type OutputKey = {
    members: "members";
    raid_progression: "raid_progression";
    raid_rankings: "raid_rankings";
    raid_encounters: "raid_encounters";
  };

  export type ProfilePayload<T extends ProfileFieldOptions> =
    ProfilePayloadBase & {
      [key in keyof OptionalGuildProfilePayloadFields as HasChildBool<
        T[key]
      > extends true
        ? OutputKey[key]
        : never]: OptionalGuildProfilePayloadFields[key];
    };
}

export class Guild {
  private client: RaiderIOClient;

  constructor(client: RaiderIOClient) {
    this.client = client;
  }

  async bossKill({
    region,
    realm,
    guild,
    raid,
    boss,
    difficulty,
  }: {
    region: string;
    realm: string;
    guild: string;
    raid: string;
    boss: string;
    difficulty: RootNS.Difficulty;
  }): Promise<GuildNS.BossKillPayload> {
    return this.client.get("/guilds/boss-kill", {
      params: {
        region,
        realm,
        guild,
        raid,
        boss,
        difficulty,
      },
    }) as any;
  }

  async profile<T extends GuildNS.ProfileFieldOptions>({
    region,
    realm,
    name,
    fields,
  }: {
    region: RootNS.Region;
    realm: RootNS.Realm;
    name: string;
    fields?: T;
  }): Promise<GuildNS.ProfilePayload<T>> {
    return this.client.get("/guilds/profile", {
      params: {
        region,
        realm,
        name,
        ...fieldsString(fields),
      },
    }) as any;
  }
}
