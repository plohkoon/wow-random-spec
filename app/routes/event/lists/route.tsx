import { Link } from "react-router";
import { H2, H3 } from "~/components/display/headers";
import { Button } from "~/components/ui/button";
import { db } from "~/lib/db.server";
import { AppSession } from "~/lib/session.server";
import { getMythicDataForTeam } from "~/lib/runData.server";
import { organizeTeams } from "~/lib/teams";
import { Route } from "./+types/route";
import { PlayerDataTable } from "./components/playerDataTable";
import { TeamDataTable } from "./components/teamDataTable";

export async function loader({ request, params: { slug } }: Route.LoaderArgs) {
  const [event, isAdmin] = await Promise.all([
    db.event.findUnique({
      where: { slug },
      include: {
        teams: {
          include: {
            players: {
              include: { team: true },
            },
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

  const parsedMythicDataArray = await Promise.all(
    teams.map((team) =>
      getMythicDataForTeam(team, {
        after: event.startDate,
        before: event.endDate,
      })
    )
  );

  return {
    event,
    teams,
    isAdmin,
    parsedMythicDataArray,
  };
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
