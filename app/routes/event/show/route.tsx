import { db } from "~/lib/db.server";
import {
  calculateAugmentedBestMythicsAndTotalScore,
  calculateBestMythicsAndTotalScore,
  calculateBestScoreAndBestUnderTime,
} from "~/lib/mythics";
import { getMythicDataForTeam } from "~/lib/runData.server";
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

  const mythicTeamZip = await Promise.all(
    teams.map(async (team) => {
        const mythicData = await getMythicDataForTeam(team, {
          after: event.startDate,
          before: event.endDate,
        });

        const [bestMythics, bestMythicsScore] =
          calculateBestMythicsAndTotalScore(mythicData ?? []);
        const [bestSingleScore, mostUnderTime] =
          calculateBestScoreAndBestUnderTime(mythicData ?? []);
        const augmented = calculateAugmentedBestMythicsAndTotalScore(
          mythicData ?? []
        );

        return {
          team,
          mythics: mythicData,
          bestMythics,
          bestMythicsScore,
          bestSingleScore,
          mostUnderTime,
          augmentedBestMythics: augmented.bestMythics,
          augmentedTotal: augmented.augmentedTotal,
          augmentedScores: Object.fromEntries(augmented.augmentedScores),
        };
    })
  );

  return { mythicTeamZip };
}

export default function Event({
  loaderData: { mythicTeamZip },
}: Route.ComponentProps) {
  return (
    <article className="w-full">
      <LeaderBoard zip={mythicTeamZip} />
    </article>
  );
}
