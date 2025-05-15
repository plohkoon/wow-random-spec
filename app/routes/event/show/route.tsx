import { Link } from "react-router";
import { H2 } from "~/components/display/headers";
import { Button } from "~/components/ui/button";
import { db } from "~/lib/db.server";
import {
  calculateBestMythicsAndTotalScore,
  calculateBestScoreAndBestUnderTime,
  getPlayersPromises,
  parseMythicDataPerTeam,
} from "~/lib/mythics";
import { RaiderIOClient } from "~/lib/raiderIO";
import { CharacterNS } from "~/lib/raiderIO/characters";
import { AppSession } from "~/lib/session.server";
import { organizeTeams } from "~/lib/teams";
import { Route } from "./+types/route";
import { LeaderBoard } from "./components/leaderboard";

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
    mythicTeamZip: Promise.all(
      teams.map(async (team, i) => {
        const mythicData = await parseMythicDataPerTeam(
          team,
          eachTeamsPlayersPromises[i]
        );

        const [bestMythics, bestMythicsScore] =
          calculateBestMythicsAndTotalScore(mythicData ?? []);
        const [bestSingleScore, mostUnderTime] =
          calculateBestScoreAndBestUnderTime(mythicData ?? []);

        return {
          team,
          mythics: mythicData,
          bestMythics,
          bestMythicsScore,
          bestSingleScore,
          mostUnderTime,
        };
      })
    ),
  };
}

export default function Event({
  loaderData: { event, isAdmin, mythicTeamZip },
  params: { slug },
}: Route.ComponentProps) {
  return (
<main className="w-full">
  <div className="flex items-center justify-between mb-2">
    <div>
      <Button asChild>
        <Link to={`/event/${slug}/lists`} className="underline">
          View Lists {">"}
        </Link>
      </Button>
    </div>
    <div className="flex-1 text-center">
      <H2>{event.name}</H2>
    </div>
  {isAdmin && (
    <div className="text-center mb-6">
      <Button asChild>
        <Link to={`/event/${slug}/edit`}>Edit</Link>
      </Button>
    </div>
  )}
</div>
  <LeaderBoard zip={mythicTeamZip} />
</main>
  );
}
