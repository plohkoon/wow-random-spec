import { RaiderIOClient } from ".";

export namespace MythicPlusNS {
  export type ScoreTiers = {
    score: number;
    rgbHex: string;
    rgbDecimal: number;
    rgbFloat: [number, number, number];
    rgbInteger: [number, number, number];
  }[];
}

export class MythicPlus {
  private client: RaiderIOClient;

  constructor(client: RaiderIOClient) {
    this.client = client;
  }

  async scoreTiers({
    season,
  }: {
    season?: string;
  } = {}): Promise<MythicPlusNS.ScoreTiers> {
    return this.client.get("/mythic-plus/score-tiers", {
      params: {
        season,
      },
    }) as any;
  }
}
