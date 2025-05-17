import { useMemo } from "react";
import { Route } from "../+types/route";
import { H2, H3, H4, H5 } from "~/components/display/headers";
import { msToDuration } from "~/lib/time";
import { ScoreDisplay } from "~/components/display/scoreDisplay";
import {
  calculateBestMythicsAndTotalScore,
  calculateBestScoreAndBestUnderTime,
  getGreenTextClass,
  MythicData,
} from "~/lib/mythics";
import { Card } from "~/components/ui/card";

function MythicsInfoInternal({
  mythics,
  bestMythicsScore,
  bestMythics,
}: {
  mythics: MythicData[];
  bestMythicsScore: number;
  bestMythics: MythicData[];
}) {
  if (!mythics) {
    return <MissingMythicInfo></MissingMythicInfo>;
  }

  const [bestSingleScore, mostUnderTime] = useMemo(() => {
    return calculateBestScoreAndBestUnderTime(mythics);
  }, [mythics]);

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <Card className="bg-[#222222] border-[#333333] p-4 text-center">
          <p className="text-2xl font-bold">
            <p className="text-sm text-gray-400">Mythics Ran</p>
            <p>{mythics.length}</p>
          </p>
        </Card>
        <Card className="bg-[#222222] border-[#333333] p-4 text-center">
          <p className="text-2xl font-bold text-green-500">
            <p className="text-sm text-gray-400">Team Score</p>
            <ScoreDisplay score={bestMythicsScore} className="font-semibold" />
          </p>
        </Card>
        <Card className="bg-[#222222] border-[#333333] p-4 text-center">
          <p className="text-2xl font-bold text-green-500">
            <p className="text-sm text-gray-400">Best Dungeon</p>
            <ScoreDisplay
              score={bestSingleScore}
              individual
              className="font-semibold"
            />
          </p>
        </Card>
        <Card className="bg-[#222222] border-[#333333] p-4 text-center">
          <p className="text-2xl font-bold text-green-500">
            <p className="text-sm text-gray-400">Furthest Under Par</p>
            <span
              className={`text-3xl font-bold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] ${getGreenTextClass(
                mostUnderTime * 100
              )}`}
            >
              {(mostUnderTime * 100).toFixed(2)}
            </span>
          </p>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-[#222222] rounded-lg overflow-hidden">
          <div className="relative h-28">
            <img src={"./imageSrc"} alt={"name"} className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#222222] via-[#22222299] to-transparent"></div>

            <div className="absolute top-2 left-3">
              <h3 className="font-bold text-white">{"name"}</h3>
            </div>

            <div className="absolute bottom-2 left-3 right-3">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <span className="font-bold mr-2">Score:</span>
                    <span className={`font-bold text-xl ${""}`}>{""}</span>
                  </div>
                  <div className="text-xs text-gray-300">
                    {/* Time: {time} / {timeLimit} ({percentage}) */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MissingMythicInfo() {
  return (
    <div className="flex flex-col gap-4">
      <H2>Mythics</H2>
      <p>No Mythic data available.</p>
    </div>
  );
}

export function MythicInfo({
  mythics,
  bestMythicsScore,
  bestMythics,
}: {
  mythics: MythicData[] | null;
  bestMythicsScore: number;
  bestMythics: MythicData[];
}) {
  return (
    <div>
      {mythics ? (
        <MythicsInfoInternal
          mythics={mythics}
          bestMythicsScore={bestMythicsScore}
          bestMythics={bestMythics}
        />
      ) : (
        <MissingMythicInfo />
      )}
    </div>
  );
}

// <div className="flex flex-col space-y-2">
//   <H2>Mythics</H2>

//   <div>
//     <H3>Best</H3>

//     <H4>Total Team Score</H4>

//     <div className="flex flex-row justify-around my-4 space-x-2">
//       <div className="flex flex-col items-center space-around space-y-2 p-4 rounded-lg border border-neutral-100 grow">
//         <ScoreDisplay
//           score={bestMythicsScore}
//           className="text-4xl font-semibold"
//         />
//         <H5>Best Score</H5>
//       </div>

//       <div className="flex flex-col items-center space-around space-y-2 p-4 rounded-lg border border-neutral-100 grow">
//         <ScoreDisplay
//           score={bestSingleScore}
//           individual
//           className="text-4xl font-semibold"
//         />
//         <H5>Best Single Dungeon</H5>
//       </div>

//       <div className="flex flex-col items-center space-around space-y-2 p-4 rounded-lg border border-neutral-100 grow">
//         <span className="text-4xl font-semibold">
//           {(mostUnderTime * 100).toFixed(2)}%
//         </span>
//         <H5>Farthest Under Par</H5>
//       </div>

//       <div className="flex flex-col items-center space-around space-y-2 p-4 rounded-lg border border-neutral-100 grow">
//         <span className="text-4xl font-semibold">{mythics.length}</span>
//         <H5>Mythics Ran</H5>
//       </div>
//     </div>

//     <H4>Dungeons</H4>

//     <div className="grid sm:grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-2">
//       {bestMythics.map((run) => (
//         <div
//           key={run.keystone_run_id}
//           // className="grow rounded-lg border-gray-100 border p-4 gap-2 bg-black/30 text-white bg-(image:--bg-image) bg-blend-darken bg-linear-to-b bg-cover bg-no-repeat pt-16 grid grid-cols-[1fr_4rem]"
//           className="grow rounded-lg border-gray-100 border p-4 gap-2 bg-background/40 bg-(image:--bg-image) dark:bg-blend-darken bg-blend-lighten bg-linear-to-b bg-cover bg-no-repeat pt-16 grid grid-cols-[1fr_4rem]"
//           style={{
//             // @ts-expect-error: Variables are not typed
//             "--bg-image": `url(${run.background_image_url})`,
//           }}
//         >
//           <div className="col-start-1 row-start-1 col-span-1 row-span-1">
//             <H4>
//               {run.dungeon} ({run.short_name} +{run.mythic_level})
//             </H4>
//             <p>
//               Time: {msToDuration(run.clear_time_ms)} /{" "}
//               {msToDuration(run.par_time_ms)} (
//               {(
//                 ((run.clear_time_ms - run.par_time_ms) / run.par_time_ms) *
//                 100
//               ).toFixed(3)}
//               %)
//             </p>
//           </div>
//           <ScoreDisplay
//             individual
//             score={run.score}
//             className="text-2xl row-start-1 row-span-2 col-start-2 col-span-1 grid place-items-center"
//           />
//         </div>
//       ))}
//     </div>
//   </div>

//   <div>
//     <H3>All Dungeons</H3>

//     <div className="grid grid-cols-1 sm:grid-cols-2">
//       {mythics
//         .filter((run) => run !== null)
//         .map((run) => (
//           <div
//             key={run.keystone_run_id}
//             className="flex flex-row sm:even:flex-row-reverse gap-4"
//           >
//             <img src={run.icon_url} className="w-16 aspect-square" />
//             <div className="flex flex-col">
//               <H4>
//                 {run.dungeon} ({run.short_name} +{run.mythic_level}){" "}
//                 <ScoreDisplay individual score={run.score} />
//               </H4>
//               <p>
//                 Time: {msToDuration(run.clear_time_ms)} /{" "}
//                 {msToDuration(run.par_time_ms)} (
//                 {(
//                   ((run.clear_time_ms - run.par_time_ms) /
//                     run.par_time_ms) *
//                   100
//                 ).toFixed(3)}
//                 %)
//               </p>
//             </div>
//           </div>
//         ))}
//     </div>
//   </div>
// </div>
