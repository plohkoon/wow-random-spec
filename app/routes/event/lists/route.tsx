import { db } from "~/lib/db.server";
import { Route } from "./+types/route";
import { H2, H3 } from "~/components/display/headers";
import { organizeTeams } from "~/lib/teams";
import { AppSession } from "~/lib/session.server";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import { PlayerDataTable } from "./components/playerDataTable";
import { TeamDataTable } from "./components/teamDataTable";
import { RaiderIOClient } from "~/lib/raiderIO";
import {
  getPlayersPromises,
  parseMythicDataPerTeam,
  MythicData,
} from "~/lib/mythics";
import { CharacterNS } from "~/lib/raiderIO/characters";

export async function loader({ request, params: { slug } }: Route.LoaderArgs) {
  const [event, isAdmin] = await Promise.all([
    db.event.findUnique({
      where: { slug },
      include: {
        teams: {
          include: {
            players: true,
          },
        },
        players: {
          include: {
            team: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    }),
    AppSession.fromRequest(request).then((session) => session.isAdmin()),
  ]);

  if (!event) {
    throw new Response("Not Found", { status: 404 });
  }

  const teams = organizeTeams(event.teams);
  const client = RaiderIOClient.getInstance();
  const eachTeamsPlayersPromises = teams.map((team) =>
    getPlayersPromises(team, client)
  );

  return {
    event,
    teams,
    isAdmin,
    eachTeamsPlayersPromises,
    parsedMythicDataArray: null,
  };
}

export const clientLoader = async ({
  serverLoader,
}: Route.ClientLoaderArgs) => {
  const serverRes = await serverLoader();

  const parsedMythicDataArray: (MythicData[] | null)[] = [];
  let counter: number = 0;

  for (const team of serverRes.teams) {
    const mythicData = await parseMythicDataPerTeam(
      team,
      serverRes.eachTeamsPlayersPromises[counter]
    );
    parsedMythicDataArray.push(mythicData);
    ++counter;
  }

  return {
    ...serverRes,
    parsedMythicDataArray,
  };
};
clientLoader.hydrate = true;

export default function Event({
  loaderData: { event, teams, isAdmin, parsedMythicDataArray },
  params: { slug },
}: Route.ComponentProps) {
  return (
    <main className="space-y-4">
      <H2>
        {event.name}{" "}
        {isAdmin ? (
          <Button asChild>
            <Link to={`/event/${slug}/edit`}>Edit</Link>
          </Button>
        ) : null}
      </H2>

      <section>
        <H3>Players</H3>
        <PlayerDataTable players={event.players} />
      </section>

      <section>
        <H3>Teams</H3>

        <div className="grid grid-cols-3">
          {teams.map((team, index) => (
            <TeamDataTable
              key={team.id}
              team={team}
              slug={slug}
              mythicData={
                parsedMythicDataArray ? parsedMythicDataArray[index] : null
              }
            />
          ))}
        </div>
      </section>
    </main>
  );
}
