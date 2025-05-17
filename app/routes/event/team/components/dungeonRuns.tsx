import { ScoreDisplay } from "~/components/display/scoreDisplay";
import { MythicData } from "~/lib/mythics";
import { msToDuration } from "~/lib/time";
import PlayerChip from "./playerChip";
import { Card } from "~/components/ui/card";

type TeamDungeonRunsProps = {
  mythics: MythicData[];
  showBanner: boolean;
};

export default function TeamDungeonRuns({
  mythics,
  showBanner,
}: TeamDungeonRunsProps) {
  console.log(mythics);
  return (
    <div>
      {!showBanner && (
        <div className="w-full h-60 relative rounded-md overflow-hidden mb-4 bg-neutral-400">
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent"></div>
          <div className="absolute bottom-4 left-4 flex items-center gap-4">
            <h1 className="text-2xl font-bold">Dungeon Runs</h1>
          </div>
        </div>
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
          <Card className="bg-black-two border-[#333333] overflow-hidden mt-2">
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
              <div className="flex flex-col">
                <h4>
                  {run.dungeon} ({run.short_name} +{run.mythic_level}){" "}
                  <ScoreDisplay individual score={run.score} />
                </h4>
                <p>
                  Time: {msToDuration(run.clear_time_ms)} /{" "}
                  {msToDuration(run.par_time_ms)} (
                  {(
                    ((run.clear_time_ms - run.par_time_ms) / run.par_time_ms) *
                    100
                  ).toFixed(3)}
                  %)
                </p>
                <div className="flex flex-row mx-2">
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

<Card className="bg-[#222222] border-[#333333] overflow-hidden">
  <div className="flex flex-col md:flex-row">
    <div className="relative h-32 md:w-48 md:h-auto">
      <img src={"/placeholder.svg"} alt={"name"} className="object-cover" />
    </div>

    <div className="flex-1 p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold">{"name"}</h3>
          {/* <p className="text-sm text-gray-400">
                Time: {time} / {timeLimit} ({percentage})
              </p> */}
        </div>
        <div className="flex items-center">
          <div className="text-right">
            {/* <p className="text-2xl font-bold text-right mr-2 whitespace-nowrap">
                  <span className={getScoreColor(score)}>{score}</span>
                </p> */}
          </div>

          {/* {stars > 0 && (
                <div className="flex">
                  {[...Array(stars)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              )} */}
        </div>
      </div>

      <div className="mt-2">
        <div className="flex flex-wrap gap-2">
          {/* <PlayerChip player={} /> */}
        </div>
      </div>
    </div>
  </div>
</Card>;
