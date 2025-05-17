import { ScoreDisplay } from "~/components/display/scoreDisplay";
import { msToDuration } from "~/lib/time";
import { getKeystoneUpgrade } from "../../player/components/mythicData";

//gotta be a better way to do this?
type Mythic = {
  keystone_run_id: string | number;
  icon_url: string;
  short_name: string;
  score: number;
  dungeon: string;
  background_image_url: string;
  mythic_level: number;
  clear_time_ms: number;
  par_time_ms: number;
  num_keystone_upgrades: number;
};

type MythicProps = {
  bestMythics: Mythic[];
};

export default function TeamBestMythicDisplay({ bestMythics }: MythicProps) {
  console.log(bestMythics);
  return (
    <>
      {bestMythics.map((run) => (
        <div className="group rounded-lg overflow-hidden transition-transform duration-300 ease-in-out transform hover:scale-105">
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
