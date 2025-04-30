import { RaiderIOClient } from "~/lib/raiderIO";
import { Route } from "./+types/test";

export const loader = async () => {
  const client = RaiderIOClient.getInstance();
  // const data = await client.periods();
  const data = await client.character.getCharacterProfile({
    region: "us",
    realm: "sargeras",
    name: "Jörmûngandr",
    fields: {
      mythic_plus_best_runs: true,
    },
  });
  // const data = await client.guild.bossKill({
  //   region: "us",
  //   realm: "sargeras",
  //   guild: "Currently Online",
  //   raid: "liberation-of-undermine",
  //   boss: "chrome-king-gallywix",
  //   difficulty: "heroic",
  // });
  // const data = await client.guild.profile({
  //   region: "us",
  //   realm: "sargeras",
  //   name: "Currently Online",
  //   fields: {
  //     raid_progression: {
  //       "previous-expansion": true,
  //     },
  //   },
  // });

  return data;
};

export default function Test({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <h1>Test</h1>
      <pre>{JSON.stringify(loaderData, null, 2)}</pre>
    </div>
  );
}
