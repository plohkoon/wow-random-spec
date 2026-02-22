import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { useMemo } from "react";
import { Link, redirect } from "react-router";
import { ScoreDisplay } from "~/components/display/scoreDisplay";
import { db } from "~/lib/db.server";
import {
  calculateAugmentedBestMythicsAndTotalScore,
  calculateBestMythicsAndTotalScore,
} from "~/lib/mythics";
import { getCachedPlayerProfile, getMythicDataForTeam } from "~/lib/runData.server";
import { RaiderIOClient } from "~/lib/raiderIO";
import { Route } from "./+types/route";
import TeamDungeonRuns from "./components/dungeonRuns";
import { MythicInfo } from "./components/mythicInfo";
import { PlayerData } from "./components/playerData";
import TeamBestMythicDisplay from "./components/teamMythicDisplay";

export const loader = async ({ params: { slug, id } }: Route.LoaderArgs) => {
  const team = await db.team.findFirst({
    where: { id },
    include: { players: { include: { team: true } } },
  });

  if (!team) {
    return redirect(`/event/${slug}`);
  }

  const event = await db.event.findFirst({ where: { slug } });

  // Try cached profiles first, fall back to live API for any missing
  const playersData = await Promise.all(
    team.players.map(async (player) => {
      if (!player.playerServer || !player.playerName) return null;

      const cached = await getCachedPlayerProfile(player.id);
      if (cached) return cached;

      console.log(
        `[TeamLoader] Cache empty for "${player.playerName}", fetching from RaiderIO API`
      );
      const client = RaiderIOClient.getInstance();
      return client.character.getCharacterProfile({
        region: "us",
        realm: player.playerServer,
        name: player.playerName,
        fields: {
          gear: true,
          mythic_plus_best_runs: { all: true },
          mythic_plus_alternate_runs: { all: true },
          mythic_plus_highest_level_runs: true,
          mythic_plus_recent_runs: true,
          mythic_plus_previous_weekly_highest_level_runs: true,
          mythic_plus_weekly_highest_level_runs: true,
        },
      });
    })
  );

  const mythicData = await getMythicDataForTeam(team, {
    after: event?.startDate,
    before: event?.endDate,
  });

  return {
    team,
    playersData,
    mythicData,
  };
};
export const action = async ({}: Route.ActionArgs) => ({});

export default function TeamShow({
  loaderData: { team, playersData, mythicData },
  params: { slug },
}: Route.ComponentProps) {
  //need to make a func to detect if a team has provided a banner photo or not
  const showBanner = false;

  const [bestMythics, bestMythicsScore] = useMemo(() => {
    return calculateBestMythicsAndTotalScore(mythicData ?? []);
  }, [mythicData]);

  const augmented = useMemo(() => {
    return calculateAugmentedBestMythicsAndTotalScore(mythicData ?? []);
  }, [mythicData]);
  return (
    <div className="space-y-6">
      <Link to={`/event/${slug}/`} className="bg-white p-2 rounded-md text-black">
        {"<"} Back to event
      </Link>
      <div className="flex justify-center mx-auto text-white p-4">
        <Tabs defaultValue="team-roster" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger
              value="team-roster"
              className="bg-white rounded-xl p-2 data-[state=active]:bg-light-blue data-[state=active]:text-black data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground transition-colors"
            >
              Team Roster
            </TabsTrigger>
            <TabsTrigger
              value="dungeon-list"
              className="bg-white rounded-xl p-2 data-[state=active]:bg-light-blue data-[state=active]:text-black data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground transition-colors"
            >
              Dungeon List
            </TabsTrigger>
          </TabsList>
          <TabsContent value="team-roster">
            {showBanner && (
              <div className="w-full h-60 relative rounded-md overflow-hidden mb-4">
                <img
                  src="https://placehold.co/420x69"
                  alt="Team Banner"
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent"></div>
                <div className="absolute bottom-4 left-4 flex items-center gap-4">
                  <h1 className="text-2xl font-bold">{team.name}</h1>
                  <span className="text-3xl font-bold text-green-500">
                    <ScoreDisplay score={bestMythicsScore} />
                  </span>
                </div>
              </div>
            )}
            {!showBanner && (
              <div></div>
              // <div className="w-full h-60 relative rounded-md overflow-hidden mb-4 bg-neutral-400">
              //   <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent"></div>
              //   <div className="absolute bottom-4 left-4 flex items-center gap-4">
              //     <h1 className="text-2xl font-bold">{team.name}</h1>
              //     <span className="text-3xl font-bold text-green-500">
              //       <ScoreDisplay score={bestMythicsScore} />
              //     </span>
              //   </div>
              // </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {playersData.map((player, index) => (
                <PlayerData player={player} key={index} />
              ))}
            </div>
            <MythicInfo
              mythics={mythicData}
              bestMythicsScore={bestMythicsScore}
              augmentedTotal={augmented.augmentedTotal}
              bestMythics={augmented.bestMythics}
            />
            <div className="bg-black-two rounded-lg p-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <TeamBestMythicDisplay bestMythics={augmented.bestMythics} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="dungeon-list">
            <TeamDungeonRuns mythics={mythicData} showBanner={showBanner} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
