import { ScoreDisplay } from "~/components/display/scoreDisplay";
import { MythicData } from "~/lib/mythics";
import { msToDuration } from "~/lib/time";

type TeamDungeonRunsProps = {
  mythics: MythicData[];
  showBanner: boolean;
};

export default function TeamDungeonRuns({
  mythics,
  showBanner,
}: TeamDungeonRunsProps) {
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
        <>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mythics
              .filter((run) => run !== null)
              .map((run) => (
                <div
                  key={run.keystone_run_id}
                  className="flex flex-row sm:even:flex-row-reverse gap-4"
                >
                  <img
                    src={run.icon_url}
                    alt={run.dungeon}
                    className="w-16 aspect-square"
                  />
                  <div className="flex flex-col">
                    <h4>
                      {run.dungeon} ({run.short_name} +{run.mythic_level}){" "}
                      <ScoreDisplay individual score={run.score} />
                    </h4>
                    <p>
                      Time: {msToDuration(run.clear_time_ms)} /{" "}
                      {msToDuration(run.par_time_ms)} (
                      {(
                        ((run.clear_time_ms - run.par_time_ms) /
                          run.par_time_ms) *
                        100
                      ).toFixed(3)}
                      %)
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
