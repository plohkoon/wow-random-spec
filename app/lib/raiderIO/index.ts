import axios, { AxiosRequestConfig, type AxiosInstance } from "axios";
// import { Root } from "./types";
import { Character } from "./characters";
import { Guild } from "./guild";

export namespace RootNS {
  export type Region = "us" | "eu" | "tw" | "kr" | "cn";
  export type Difficulty = "lfr" | "normal" | "heroic" | "mythic";
  export type Raid = string;
  export type Realm = string;
  export type Faction = "horde" | "alliance";
  export type Role = string;
  export type Spec = string;
  export type Class = string;
  export type Race = string;
  export type DateTime = string;

  export type Period = {
    period: number;
    start: DateTime;
    end: DateTime;
  };

  export type Periods = {
    region: Region;
    previous: Period;
    current: Period;
    next: Period;
  };

  export type PeriodPayload = {
    periods: Periods[];
  };
}

export class RaiderIOClient {
  private static instance: RaiderIOClient;
  private client: AxiosInstance;
  private apiKey: string | undefined;

  private subClients: {
    character: Character;
    guild: Guild;
  };

  private constructor(apiKey: string | undefined = undefined) {
    this.apiKey = apiKey ?? process.env.RAIDERIO_API_KEY;

    this.client = axios.create({
      baseURL: "https://raider.io/api/v1",
      timeout: 10000,
    });

    this.client.interceptors.request.use((config) => {
      if (this.apiKey) {
        if (config.method === "get") {
          config.params = {
            ...config.params,
            access_key: this.apiKey,
          };
        } else if (config.method === "post") {
          config.data = {
            ...config.data,
            access_key: this.apiKey,
          };
        }
      }

      return config;
    });

    this.client.interceptors.response.use(
      (response) => {
        return response.data;
      },
      (error) => {
        console.error("Error in RaiderIO API request:", error);
        if (!(error instanceof Error)) {
          error = new Error(JSON.stringify(error));
        }

        return Promise.reject(error);
      }
    );

    this.subClients = {
      character: new Character(this),
      guild: new Guild(this),
    };
  }

  public static getInstance(): RaiderIOClient {
    if (!RaiderIOClient.instance) {
      RaiderIOClient.instance = new RaiderIOClient();
    }
    return RaiderIOClient.instance;
  }

  async get(url: string, config?: AxiosRequestConfig<any> | undefined) {
    return this.client.get(url, config);
  }

  async periods(): Promise<RootNS.PeriodPayload> {
    return this.get("/periods") as any;
  }

  get character(): Character {
    return this.subClients.character;
  }

  get guild(): Guild {
    return this.subClients.guild;
  }
}
