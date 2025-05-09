import { db } from "~/lib/db.server";
import { Route } from "./+types/route";
import { H2, H3 } from "~/components/display/headers";
import { organizeTeams } from "~/lib/teams";
import { AppSession } from "~/lib/session.server";
import { Button } from "~/components/ui/button";
import {Link} from "react-router";
import { PlayerDataTable } from "./components/playerDataTable";
import { TeamDataTable } from "./components/teamDataTable";
import {RaiderIOClient} from "~/lib/raiderIO";
import { ParseMythicDataPerTeam } from "~/lib/mythics"

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
  const parsedMythicDataArray: any[] = [];

  const client = await RaiderIOClient.getInstance();

  for(const team of teams) {
    const playersPromises = team.players.map((player) =>
        player.playerServer && player.playerName
            ? client.character.getCharacterProfile({
              region: "us",
              realm: player.playerServer,
              name: player.playerName,
              fields: {
                gear: true,
                mythic_plus_best_runs: true,
                mythic_plus_alternate_runs: true,
                mythic_plus_highest_level_runs: true,
                mythic_plus_recent_runs: true,
                mythic_plus_previous_weekly_highest_level_runs: true,
                mythic_plus_weekly_highest_level_runs: true,
              },
            })
            : Promise.resolve(null)
    );

    const mythicsParsedPerTeam = await ParseMythicDataPerTeam(team.players, playersPromises);

    parsedMythicDataArray.push(mythicsParsedPerTeam.mythicsPromise);
  }

  return { event, teams, isAdmin, parsedMythicDataArray };
}

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
            <TeamDataTable key={team.id} team={team} slug={slug} mythicData={parsedMythicDataArray[index]} />
          ))}
        </div>
      </section>
    </main>
  );
}
