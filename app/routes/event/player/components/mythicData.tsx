import { ChevronDown, ChevronUp, Hourglass, Star } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { ScoreDisplay } from "~/components/display/scoreDisplay";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";


//Function to return an amount of stars based on the upgrade of the key ran.
//idk if this is safe to do tbh
export function getKeystoneUpgrade(upgrades: number) {
  return (
    <>
      {Array.from({ length: upgrades }, (_: number, i: number) => (
        <Star key={i} className="w-5 h-5 fill-current text-gold-yellow" />
      ))}
    </>
  );
};

export default function PlayerMythicData({ props, msToDuration }: any) {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <>
      <Card className="border-neutral-300 dark:border-black-two bg-neutral-300 dark:bg-black-bg shadow-2xl">
        <CardHeader className="border-b border-white/20 flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold text-[#FFD166] flex items-center drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
            <Hourglass className="mr-2 h-5 w-5" />
            Mythic+ Scores
          </CardTitle>
          {/* Only show collapse button on mobile */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white hover:text-light-blue hover:bg-neutral-400 dark:hover:bg-black-two lg:hidden"
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-black dark:text-white" />
            ) : (
              <ChevronDown className="h-5 w-5 text-black dark:text-white" />
            )}
          </Button>
        </CardHeader>

        {/* Always show content on desktop, respect isExpanded on mobile */}
        <div
          className={`${
            !isExpanded ? "hidden lg:block" : "block"
          } transition-all duration-300 ease-in-out`}
        >
          <CardContent className="pt-6 transition-all duration-300 ease-in-out">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {props.mythic_plus_best_runs.map((run: any) => (
                <Link to={run.url} target="_blank">
                  <div
                    key={run.id}
                    className="relative h-48 rounded-lg overflow-hidden group"
                  >
                    <img
                      src={run.background_image_url}
                      alt={run.dungeon}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                      <h3 className="text-lg font-bold text-white drop-shadow-md">
                        {run.dungeon}
                      </h3>
                      <div className={`text-3xl font-bold mt-2 text-white`}>
                        Score: <ScoreDisplay individual score={run.score} />
                      </div>
                      <div className="text-sm text-gray-200 mt-1">
                        {" "}
                        Time: {msToDuration(run.clear_time_ms)} /{" "}
                        {msToDuration(run.par_time_ms)} (
                        {(
                          ((run.clear_time_ms - run.par_time_ms) /
                            run.par_time_ms) *
                          100
                        ).toFixed(3)}
                        %)
                      </div>
                      <div className="flex mx-auto text-gold-yellow mt-1">
                        {getKeystoneUpgrade(run.num_keystone_upgrades)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </div>
      </Card>
    </>
  );
};
