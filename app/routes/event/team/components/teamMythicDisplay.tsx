import { ScoreDisplay } from "~/components/display/scoreDisplay";
import type { MythicData } from "~/lib/mythics";
import { msToDuration } from "~/lib/time";
import { getKeystoneUpgrade } from "../../player/components/mythicData";

type MythicProps = {
  bestMythics: MythicData[];
};

function getParticipantBadgeClass(count: number): string {
  if (count >= 5) return "bg-green-700/80";
  if (count <= 3) return "bg-amber-700/80";
  return "bg-black/60";
}

export default function TeamBestMythicDisplay({ bestMythics }: MythicProps) {
  return (
    <>
      {bestMythics.map((run) => (
        <div
          className="group rounded-lg overflow-hidden transition-transform duration-300 ease-in-out transform hover:scale-105"
          key={run.keystone_run_id}
        >
          <div className="relative h-36 shadow-2xl">
            <img
              src={run.background_image_url}
              alt={run.dungeon}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#222222] via-[#22222299] to-transparent" />
            <div className="absolute top-2 left-3 flex items-center space-x-2">
              <h3 className="font-bold text-white text-lg flex items-center">
                +{run.mythic_level} {run.dungeon}
                <span className="text-gold-yellow ml-2 flex">
                  {getKeystoneUpgrade(run.num_keystone_upgrades)}
                </span>
              </h3>
            </div>

            <span
              className={`absolute top-2 right-3 text-xs font-semibold text-white px-1.5 py-0.5 rounded ${getParticipantBadgeClass(run.participants.length)}`}
            >
              {run.participants.length}/5
            </span>

            <div className="absolute bottom-2 left-3 right-3">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <p className="mb-2">
                    Time: {msToDuration(run.clear_time_ms)} /{" "}
                    {msToDuration(run.par_time_ms)} (
                    {(
                      ((run.clear_time_ms - run.par_time_ms) /
                        run.par_time_ms) *
                      100
                    ).toFixed(3)}
                    %)
                  </p>
                  <div className="flex items-center">
                    <span className="font-bold mr-2 text-xl">
                      Score:
                      <ScoreDisplay
                        individual
                        score={run.score}
                        className="text-xl"
                      />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
