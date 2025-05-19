import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { ChevronDown, Users } from "lucide-react";
import { Suspense, useMemo, useState } from "react";
import { Await, Link, useParams } from "react-router";
import { PlayerShortDisplay } from "~/components/display/playerShortDisplay";
import { ScoreDisplay } from "~/components/display/scoreDisplay";
import { Button } from "~/components/ui/button";
import MythicDisplay from "~/components/ui/mythicdisplay";
import { getGreenTextClass } from "~/lib/mythics";
import { Route } from "../+types/route";

type MythicZip = NonNullable<
  Awaited<Route.ComponentProps["loaderData"]["mythicTeamZip"]>
>;
type MythicZipPromise = Promise<MythicZip | null>;

type Sort = "single_score" | "team_score" | "num_ran" | "under_par" | null;

function getMedalColourClass(value: number): string {
  if (value === 1) return "text-black bg-yellow-400";
  if (value === 2) return "text-black bg-gray-300";
  if (value === 3) return "text-white bg-amber-700";
  return "text-black bg-white";
}

const SORT_LABELS: Record<NonNullable<Sort>, string> = {
  single_score: "Best Single Score",
  team_score: "Team Score",
  num_ran: "Mythic Ran",
  under_par: "Most Under Par",
};

function LeaderBoardInternal({ zip }: { zip: MythicZip }) {
  const { slug } = useParams();
  const [sortBy, setSortBy] = useState<Sort>(null);
  const orderedZip = useMemo(() => {
    if (!sortBy) return zip;

    const sortFn = (a: MythicZip[number], b: MythicZip[number]) => {
      if (sortBy === "single_score") {
        return b.bestSingleScore - a.bestSingleScore;
      } else if (sortBy === "team_score") {
        return b.bestMythicsScore - a.bestMythicsScore;
      } else if (sortBy === "num_ran") {
        const aMythics = a.mythics?.length ?? 0;
        const bMythics = b.mythics?.length ?? 0;
        return bMythics - aMythics;
      } else if (sortBy === "under_par") {
        return a.mostUnderTime - b.mostUnderTime;
      }
      return 0;
    };

    return [...zip].sort(sortFn);
  }, [zip, sortBy]);

  // the dang component
  return (
    <>
      <div className="w-full">
        <Tabs
          defaultValue="team_score"
          value={sortBy ?? "null"}
          onValueChange={(val) => {
            setSortBy(val === "null" ? null : (val as typeof sortBy));
          }}
          className="w-full"
        >
          <TabsContent value={sortBy ?? "null"}>
            {/* We use a dropdown for small screens */}
            <div className="flex justify-center flex-wrap gap-2 mt-6 md:hidden">
              <DropdownMenu>
                <span className="text-sm text-gray-400 mr-2 mt-2">
                  Sort By:
                </span>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-neutral-300 dark:border-gray-700 bg-neutral-300 dark:bg-gray-900"
                  >
                    {sortBy ? SORT_LABELS[sortBy] : "Unsorted"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="bottom"
                  align="end"
                  className="z-50 bg-neutral-300 dark:bg-gray-900 border border-gray-700 mt-1 min-w-[180px]"
                >
                  <DropdownMenuItem onClick={() => setSortBy("num_ran")}>
                    Mythic Ran
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("team_score")}>
                    Team Score
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("single_score")}>
                    Best Single Score
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("under_par")}>
                    Most Under Par
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy(null)}>
                    Unsorted
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {/* We use tabs for large screens */}
            <TabsList className="hidden justify-center flex-wrap gap-2 mb-4 mt-4 md:flex">
              <p className="text-sm text-black dark:text-gray-400 my-auto me-2">
                Sort By:
              </p>
              <TabsTrigger
                value="num_ran"
                className="px-4 py-2 rounded-lg text-sm font-medium data-[state=active]:bg-light-blue data-[state=active]:text-black data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground transition-colors"
              >
                Mythic Ran
              </TabsTrigger>
              <TabsTrigger
                value="team_score"
                className="px-4 py-2 rounded-lg text-sm font-medium data-[state=active]:bg-light-blue data-[state=active]:text-black data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground transition-colors"
              >
                Team Score
              </TabsTrigger>
              <TabsTrigger
                value="single_score"
                className="px-4 py-2 rounded-lg text-sm font-medium data-[state=active]:bg-light-blue data-[state=active]:text-black data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground transition-colors"
              >
                Best Single Score
              </TabsTrigger>
              <TabsTrigger
                value="under_par"
                className="px-4 py-2 rounded-lg text-sm font-medium data-[state=active]:bg-light-blue data-[state=active]:text-black data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground transition-colors"
              >
                Most Under Par
              </TabsTrigger>
              <TabsTrigger
                value="null"
                className="px-4 py-2 rounded-lg text-sm font-medium data-[state=active]:bg-light-blue data-[state=active]:text-black data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground transition-colors"
              >
                Unsorted
              </TabsTrigger>
            </TabsList>
            <ol className="list-decimal list-outside space-y-4">
              {orderedZip.map(
                (
                  {
                    team,
                    mythics,
                    bestMythics,
                    bestMythicsScore,
                    mostUnderTime,
                    bestSingleScore,
                  },
                  index
                ) => {
                  return (
                    <li key={team.id} className="px-6 lg:px-24 lg:mt-12 mt-4">
                      <div className="w-full mx-auto bg-white dark:bg-black text-white p-6 rounded-xl mb-12">
                        <div className="flex items-center justify-between mb-6"></div>
                        <div className="space-y-4">
                          <div className="relative bg-gradient-to-r from-stone-300 to-stone-400 dark:from-[#2A2A2A] dark:to-[#333333] dark:bg-gradient-to-r rounded-xl p-6 border border-neutral-200 dark:border-black-light shadow-xl">
                            {/* "Place" of team (1st, 2nd, 3rd etc) */}
                            <div
                              className={`absolute -top-3 -left-3 text-black font-bold rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-lg ${getMedalColourClass(
                                index + 1
                              )}`}
                            >
                              {index + 1}
                            </div>
                            <div className="mb-8">
                              {/* Team Name */}
                              <div className="flex justify-center mb-2">
                                <h2 className="text-3xl md:text-4xl lg:text-5xl mb-4 underline decoration-3 decoration-white dark:decoration-light-brown font-bold flex items-center gap-2 overflow-hidden whitespace-nowrap">
                                  <Users className="h-8 w-8 text-gray-400" />
                                  <Link
                                    to={`/event/${slug}/team/${team.id}`}
                                    className="truncate overflow-hidden whitespace-nowrap block text-black dark:text-white"
                                  >
                                    {team.name}
                                  </Link>
                                </h2>
                              </div>
                              {/* Team Players */}
                              <div className="flex flex-wrap justify-center gap-2">
                                {team.players.map((player: any) => (
                                  <Link
                                    key={player.id}
                                    to={`/event/${slug}/player/${player.id}`}
                                  >
                                    <PlayerShortDisplay
                                      player={player}
                                      className="text-lg before:w-4 before:h-4 underline"
                                    />
                                  </Link>
                                ))}
                              </div>
                            </div>
                            {/* Statistics for Team */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div className="bg-stone-300 dark:bg-black-two rounded-lg p-4 flex flex-col items-center justify-center">
                                <span className="text-black dark:text-gray-400 text-sm mb-1">
                                  Mythics Ran
                                </span>
                                <span className="text-3xl font-bold text-black dark:text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                                  {mythics?.length ?? 0}
                                </span>
                              </div>
                              <div className="bg-stone-300 dark:bg-black-two rounded-lg p-4 flex flex-col items-center justify-center">
                                <span className="text-black dark:text-gray-400 text-sm mb-1">
                                  Team Score
                                </span>
                                <span className="text-3xl font-bold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                                  <ScoreDisplay score={bestMythicsScore} />
                                </span>
                              </div>
                              <div className="bg-stone-300 dark:bg-black-two rounded-lg p-4 flex flex-col items-center justify-center">
                                <span className="text-black dark:text-gray-400 text-sm mb-1">
                                  Single Score
                                </span>
                                <span className="text-3xl font-bold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                                  <ScoreDisplay
                                    score={bestSingleScore}
                                    individual
                                  />
                                </span>
                              </div>
                              <div className="bg-stone-300 dark:bg-black-two rounded-lg p-4 flex flex-col items-center justify-center">
                                <span className="text-black dark:text-gray-400 text-sm mb-1">
                                  Under Par
                                </span>
                                <span
                                  className={`text-3xl font-bold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] ${getGreenTextClass(
                                    mostUnderTime * 100
                                  )}`}
                                >
                                  {(mostUnderTime * 100).toFixed(2)}
                                </span>
                              </div>
                            </div>
                            {/* Mythic Display list component */}
                            <MythicDisplay bestMythics={bestMythics} />
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                }
              )}
            </ol>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function LeaderBoardLoading() {
  return <div className="text-center">Loading...</div>;
}

function LeaderBoardMissing() {
  return <div className="text-center">No Mythic Data Found</div>;
}

export function LeaderBoard({ zip }: { zip: MythicZipPromise | null }) {
  return (
    <Suspense fallback={<LeaderBoardLoading />}>
      <Await resolve={zip}>
        {(mythicZip) => {
          if (!mythicZip) return <LeaderBoardMissing />;

          return <LeaderBoardInternal zip={mythicZip} />;
        }}
      </Await>
    </Suspense>
  );
}

// old code for reference rn
{
  /* <div className="flex flex-row space-x-4 flex-wrap">
        <p>Sort By:</p>
        <Button
          variant={sortBy === "num_ran" ? "default" : "outline"}
          onClick={() => setSortBy("num_ran")}
        >
          Mythic Ran
        </Button>
        <Button
          variant={sortBy === "team_score" ? "default" : "outline"}
          onClick={() => setSortBy("team_score")}
        >
          Team Score
        </Button>

        <Button
          variant={sortBy === "single_score" ? "default" : "outline"}
          onClick={() => setSortBy("single_score")}
        >
          Best Single Score
        </Button>

        <Button
          variant={sortBy === "under_par" ? "default" : "outline"}
          onClick={() => setSortBy("under_par")}
        >
          Most Under Par
        </Button>

        <Button
          variant={sortBy === null ? "default" : "outline"}
          onClick={() => setSortBy(null)}
        >
          Unsorted
        </Button>
      </div> */
}

{
  /* <div>
                      <div className="flex flex-row justify-evenly flex-wrap">
                        <Link to={`/event/${slug}/team/${team.id}`}>
                          <H3 className="underline">{team.name}:</H3>
                        </Link>
                        {team.players.map((player) => (
                          <Link
                            to={`/event/${slug}/player/${player.id}`}
                            key={player.id}
                          >
                            <PlayerShortDisplay
                              key={player.id}
                              player={player}
                              className="text-xl font-bold before:w-8 before:h-8 underline"
                            />
                          </Link>
                        ))}
                      </div>
                      <ul className="grid grid-cols-2 sm:grid-cols-4 p-4 gap-2">
                        <li className="rounded-lg border border-neutral-100 grow">
                          <div className="flex flex-col items-center space-around pb-2 pt-2 ps-1 pe-1">
                            <span className="text-4xl font-semibold">
                              {mythics?.length ?? 0}
                            </span>
                            <span className="text-md font-bold">
                              Mythics Ran
                            </span>
                          </div>
                        </li>
                        <li className="rounded-lg border border-neutral-100 grow">
                          <div className="flex flex-col items-center space-around pb-2 pt-2 ps-1 pe-1">
                            <ScoreDisplay
                              score={bestMythicsScore}
                              className="text-4xl font-semibold"
                            />
                            <span className="text-md font-bold">
                              Team Score
                            </span>
                          </div>
                        </li>

                        <li className="rounded-lg border border-neutral-100 grow">
                          <div className="flex flex-col items-center space-around pb-2 pt-2 ps-1 pe-1">
                            <ScoreDisplay
                              score={bestSingleScore}
                              individual
                              className="text-4xl font-semibold"
                            />
                            <span className="text-md font-bold">
                              Single Score
                            </span>
                          </div>
                        </li>
                        <li className="rounded-lg border border-neutral-100 grow">
                          <div className="flex flex-col items-center space-around pb-2 pt-2 ps-1 pe-1">
                            <span className="text-4xl font-semibold">
                              {(mostUnderTime * 100).toFixed(2)}%
                            </span>
                            <span className="text-md font-bold">Under Par</span>
                          </div>
                        </li>
                      </ul>

                      <ul className="flex flex-row gap-2 justify-evenly flex-wrap">
                        {bestMythics.map((mythic) => (
                          <li
                            key={mythic.keystone_run_id}
                            className="bg-(image:--bg-image) h-16 w-16 bg-cover grid place-items-center bg-background/30 dark:bg-blend-darken bg-blend-lighten bg-no-repeat"
                            style={{
                              // @ts-expect-error: Variables are not typed
                              "--bg-image": `url(${mythic.icon_url})`,
                            }}
                          >
                            <ScoreDisplay
                              score={mythic.score}
                              individual
                              className="text-xl font-bold"
                            />
                            <H5>{mythic.short_name}</H5>
                          </li>
                        ))}
                      </ul>
                    </div> */
}
