import { Link, redirect } from "react-router";
import { H2 } from "~/components/display/headers";
import { db } from "~/lib/db.server";
import { Route } from "./+types/route";
import { RaiderIOClient } from "~/lib/raiderIO";
import { PlayerData } from "./components/playerData";
import { MythicInfo } from "./components/mythicInfo";
import { calculateBestMythicsAndTotalScore, getPlayersPromises, parseMythicDataPerTeam } from "~/lib/mythics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { useEffect, useMemo, useState } from "react";

export const loader = async ({ params: { slug, id } }: Route.LoaderArgs) => {
  const team = await db.team.findFirst({
    where: { id },
    include: { players: { include: { team: true } } },
  });

  if (!team) {
    return redirect(`/event/${slug}`);
  }

  const client = RaiderIOClient.getInstance();

  const playersPromises = getPlayersPromises(team, client);

  return {
    team,
    playersPromises,
    mythicData: null,
  };
};
export const action = async ({}: Route.ActionArgs) => ({});

export const clientLoader = async ({
  serverLoader,
}: Route.ClientLoaderArgs) => {
  const serverRes = await serverLoader();

  const mythicData = await parseMythicDataPerTeam(
    serverRes.team,
    serverRes.playersPromises
  );

  return {
    ...serverRes,
    mythicData,
  };
};
clientLoader.hydrate = true;


export default function TeamShow({
  loaderData: { team, playersPromises, mythicData },
  params: { slug },
}: Route.ComponentProps) {
  const showBanner = true;
  console.log(team);
  console.log(mythicData);

  const [bestMythics, bestMythicsScore] = useMemo(() => {
    return calculateBestMythicsAndTotalScore(mythicData ?? []);
  }, [mythicData]);

  return (
    <div>
      <Link to={`/event/${slug}/`} className="underline">
        {"<"} Back to event.
      </Link>
      <div className="flex justify-center mx-auto min-h-screen text-white p-4">
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
              <div className="w-full h-40 relative rounded-md overflow-hidden mb-4">
                <img
                  src="/placeholder.svg?height=160&width=1200"
                  alt="Team Banner"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent"></div>
                <div className="absolute bottom-4 left-4 flex items-center gap-4">
                  <h1 className="text-2xl font-bold">{team.name}</h1>
                  <span className="text-3xl font-bold text-green-500">{}</span>
                </div>
              </div>
            )}
            {playersPromises.map((playerPromise, index) => (
              <PlayerData player={playerPromise} key={index} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
      {/* {/* <H2>{team.name}</H2>  */}
      <MythicInfo mythics={mythicData} bestMythicsScore={bestMythicsScore} bestMythics={bestMythics}/>
    </div>
  );
}
