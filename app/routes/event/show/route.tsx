import { db } from "~/lib/db.server";
import { Route } from "./+types/route";
import {
  TableHead,
  TableHeader,
  TableRow,
  Table,
  TableCell,
} from "~/components/ui/table";
import { TableBody } from "~/components/ui/table";
import { H2, H3 } from "~/components/display/headers";
import { ClassDisplay } from "~/components/display/classDisplay";
import { RoleDisplay } from "~/components/display/roleDisplay";
import { organizeTeams } from "~/lib/teams";
import { AppSession } from "~/lib/session.server";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import { PlayerDataTable } from "./components/playerDataTable";
import { TeamDataTable } from "./components/teamDataTable";

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

  return { event, teams, isAdmin };
}

export default function Event({
  loaderData: { event, teams, isAdmin },
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
          {teams.map((team) => (
            <TeamDataTable key={team.id} team={team} />
          ))}
        </div>
      </section>
    </main>
  );
}
