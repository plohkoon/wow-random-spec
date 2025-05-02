import axios, { AxiosRequestConfig, type AxiosInstance } from "axios";
import { Character } from "./characters";
import { Guild } from "./guild";
import { LRUCache } from "lru-cache";
import { cachified } from "@epic-web/cachified";
import { MAX_CACHE_SIZE, RAIDERIO_API_KEY, TTL } from "../env.server";
import { MythicPlus } from "./mythicPlus";

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
  private cache: LRUCache<string, any>;
  private client: AxiosInstance;
  private apiKey: string | undefined;
  private ttl: number;

  private subClients: {
    character: Character;
    guild: Guild;
    mythicPlus: MythicPlus;
  };

  private constructor({
    apiKey = RAIDERIO_API_KEY,
    maxCacheSize = MAX_CACHE_SIZE,
    ttl = TTL,
  }: {
    apiKey?: string | undefined;
    maxCacheSize?: number;
    ttl?: number;
  } = {}) {
    this.apiKey = apiKey ?? RAIDERIO_API_KEY;

    this.client = axios.create({
      baseURL: "https://raider.io/api/v1",
      timeout: 10000,
    });

    this.cache = new LRUCache({
      max: maxCacheSize ?? MAX_CACHE_SIZE,
      ttl: ttl ?? TTL,
    });

    this.ttl = ttl;

    this.client.interceptors.request.use((config) => {
      // We need to attach the API key to the request if it exists
      // either to the params of a get request
      // or to the data of a post request
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

      // If the request is a get request, we need to cache it
      // to prevent shitheads from spamming the API with our key
      // so we replace the adapter with a cachified one.
      if (config.method === "get") {
        const cacheKey = `${config.url}?${new URLSearchParams(
          config.params
        ).toString()}`;

        config.adapter = async () => {
          const data = await cachified({
            key: cacheKey,
            cache: {
              get: async (key) => this.cache.get(key),
              set: async (key, value) => this.cache.set(key, value),
              delete: async (key) => this.cache.delete(key),
            },
            ttl: this.cache.ttl,
            staleWhileRevalidate: this.swrTtl,
            getFreshValue: async () => {
              console.log("Fetching fresh data from RaiderIO API");
              const res = await axios.request({
                ...config,
                adapter: undefined,
              });
              return res.data;
            },
          });

          return {
            data,
            status: 200,
            statusText: "OK",
            headers: {},
            config,
          };
        };
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
      mythicPlus: new MythicPlus(this),
    };
  }

  public static getInstance(): RaiderIOClient {
    if (!RaiderIOClient.instance) {
      RaiderIOClient.instance = new RaiderIOClient();
    }
    return RaiderIOClient.instance;
  }

  get swrTtl() {
    return this.ttl / 10;
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

  get mythicPlus(): MythicPlus {
    return this.subClients.mythicPlus;
  }
}
