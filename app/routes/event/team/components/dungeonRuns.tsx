import { ScoreDisplay } from "~/components/display/scoreDisplay";
import { MythicData } from "~/lib/mythics";
import { msToDuration } from "~/lib/time";
import PlayerChip from "./playerChip";
import { Card } from "~/components/ui/card";

type TeamDungeonRunsProps = {
  mythics: MythicData[] | null;
  showBanner: boolean;
};

function formatDate(str: string) {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  } as const;

  const runTime = new Date(str);
  const runDate = runTime.toLocaleDateString("en-US", options);
  const time = runTime.toLocaleTimeString();
  return runDate + " " + time;
}

export default function TeamDungeonRuns({
  mythics,
  showBanner,
}: TeamDungeonRunsProps) {
  if (!mythics) {
    return <div>No Mythics Found pleb.</div>;
  }

  return (
    <div>
      {/* TODO: Make a team banner */}
      {!showBanner && (
        <div></div>
        // <div className="w-full h-60 relative rounded-md overflow-hidden mb-4 bg-neutral-400">
        //   <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent"></div>
        //   <div className="absolute bottom-4 left-4 flex items-center gap-4">
        //     <h1 className="text-2xl font-bold">Dungeon Runs</h1>
        //   </div>
        // </div>
      )}

      {showBanner && (
        <div className="w-full h-60 relative rounded-md overflow-hidden mb-4">
          <img
            src="https://placehold.co/420x69"
            alt="Team Banner"
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent"></div>
          <div className="absolute bottom-4 left-4 flex items-center gap-4">
            <h1 className="text-2xl font-bold">Dungeon Runs</h1>
          </div>
        </div>
      )}
      {mythics
        .filter((run) => run !== null)
        .map((run) => (
          <Card
            className="bg-black-two border-[#333333] overflow-hidden mt-2 -py-6"
            key={run.keystone_run_id}
          >
            <div
              key={run.keystone_run_id}
              className="flex flex-col md:flex-row"
            >
              <div className="relative h-32 md:w-48 md:h-auto">
                <img
                  src={run.background_image_url}
                  alt={run.dungeon}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex-1 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xl text-center md:text-left lg:text-left xl:text-left">
                      +{run.mythic_level} {run.dungeon}
                    </h4>
                    <span>
                      Time: {msToDuration(run.clear_time_ms)} /{" "}
                      {msToDuration(run.par_time_ms)} (
                      {(
                        ((run.clear_time_ms - run.par_time_ms) /
                          run.par_time_ms) *
                        100
                      ).toFixed(3)}
                      %)
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-right mr-2 whitespace-nowrap">
                        <ScoreDisplay individual score={run.score} />
                      </p>
                    </div>
                  </div>
                </div>
                {formatDate(run.completed_at).toString()}
                <div className="flex flex-row mt-2">
                  {run.participants
                    .filter((p) => p.playerName)
                    .map((player) => (
                      <PlayerChip key={player.id} player={player} />
                    ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
    </div>
  );
}
