import { Link } from "react-router";
import { Route } from "./+types/route";
import { H2 } from "~/components/display/headers";
import { db } from "~/lib/db.server";
import { RaiderIOClient } from "~/lib/raiderIO";
import { CharacterNS } from "~/lib/raiderIO/characters";
import { getPlayersPromises, parseMythicDataPerTeam } from "~/lib/mythics";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "~/components/ui/table";
import { msToDuration } from "~/lib/time";

export async function loader({ params: { slug } }: Route.LoaderArgs) {
  const event = await db.event.findUnique({
    where: { slug },
    include: {
      teams: {
        include: {
          players: true,
        },
      },
    },
  });

  if (!event) {
    throw new Response("Not Found", { status: 404 });
  }

  const client = RaiderIOClient.getInstance();
  const teamPromises = await Promise.all(
    event.teams.map((team) =>
      parseMythicDataPerTeam(team, getPlayersPromises(team, client))
    )
  );

  const allDungeons = teamPromises.flatMap((team) => (team ? team : []));

  const allDungeonsByDungeon = allDungeons.reduce((acc, dungeon) => {
    if (!acc.has(dungeon.dungeon)) {
      acc.set(dungeon.dungeon, []);
    }
    acc.get(dungeon.dungeon)?.push(dungeon);

    return acc;
  }, new Map<string, CharacterNS.MythicPlusRun[]>());

  const numberOfRuns = allDungeons.length;
  const leastRunDungeon = [...allDungeonsByDungeon.entries()].reduce(
    (acc, [dungeon, runs]) => {
      if (runs.length < acc[1].length) {
        return [dungeon, runs];
      }
      return acc;
    }
  );
  const mostRunDungeon = [...allDungeonsByDungeon.entries()].reduce(
    (acc, [dungeon, runs]) => {
      if (runs.length > acc[1].length) {
        return [dungeon, runs];
      }
      return acc;
    }
  );
  const avgKeyLevel =
    allDungeons.reduce((acc, dungeon) => acc + dungeon.mythic_level, 0) /
    numberOfRuns;

  const timedDungeons = allDungeons.filter(
    (dungeon) => dungeon.clear_time_ms <= dungeon.par_time_ms
  );
  const untimeDungeons = allDungeons.filter(
    (dungeon) => dungeon.clear_time_ms > dungeon.par_time_ms
  );

  const numberOfTimedDungeons = timedDungeons.length;
  const numberOfUntimedDungeons = untimeDungeons.length;

  const totalTimeInDungeons = allDungeons.reduce(
    (acc, dungeon) => acc + dungeon.clear_time_ms,
    0
  );
  const totalOverTime = allDungeons.reduce(
    (acc, dungeon) =>
      acc + Math.max(0, dungeon.clear_time_ms - dungeon.par_time_ms),
    0
  );

  return {
    event,
    numberOfRuns,
    leastRunDungeon: leastRunDungeon[0],
    leastRunDungeonRuns: leastRunDungeon[1].length,
    mostRunDungeon: mostRunDungeon[0],
    mostRunDungeonRuns: mostRunDungeon[1].length,
    avgKeyLevel,
    numberOfTimedDungeons,
    numberOfUntimedDungeons,
    totalTimeInDungeons,
    totalOverTime,
  };
}

export default function EventStats({
  params,
  loaderData: {
    event,
    numberOfRuns,
    leastRunDungeon,
    leastRunDungeonRuns,
    mostRunDungeon,
    mostRunDungeonRuns,
    avgKeyLevel,
    numberOfTimedDungeons,
    numberOfUntimedDungeons,
    totalTimeInDungeons,
    totalOverTime,
  },
}: Route.ComponentProps) {
  return (
    <div>
      <Link to={`/event/${params.slug}/`}>Back</Link>
      <H2>{event.name}</H2>
      <Table>
        <TableBody>
          <TableRow>
            <TableHead>Number of Runs</TableHead>
            <TableCell>{numberOfRuns}</TableCell>
          </TableRow>
          <TableRow>
            <TableHead>Least Run Dungeon Runs</TableHead>
            <TableCell>
              {leastRunDungeonRuns} ({leastRunDungeon})
            </TableCell>
          </TableRow>
          <TableRow>
            <TableHead>Most Run Dungeon Runs</TableHead>
            <TableCell>
              {mostRunDungeonRuns} ({mostRunDungeon})
            </TableCell>
          </TableRow>
          <TableRow>
            <TableHead>Average Key Level</TableHead>
            <TableCell>{avgKeyLevel.toFixed(2)}</TableCell>
          </TableRow>
          <TableRow>
            <TableHead>Timed Dungeons</TableHead>
            <TableCell>{numberOfTimedDungeons}</TableCell>
          </TableRow>
          <TableRow>
            <TableHead>Untimed Dungeons</TableHead>
            <TableCell>{numberOfUntimedDungeons}</TableCell>
          </TableRow>
          <TableRow>
            <TableHead>Percent Timed</TableHead>
            <TableCell>
              {((numberOfTimedDungeons / numberOfRuns) * 100).toFixed(2)}%
            </TableCell>
          </TableRow>
          <TableRow>
            <TableHead>Total Time in Dungeons</TableHead>
            <TableCell>{msToDuration(totalTimeInDungeons)}</TableCell>
          </TableRow>
          <TableRow>
            <TableHead>Total Wasted Over Time</TableHead>
            <TableCell>{msToDuration(totalOverTime)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
