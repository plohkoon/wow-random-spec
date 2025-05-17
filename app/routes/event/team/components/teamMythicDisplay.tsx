type Mythic = {
  keystone_run_id: string | number;
  icon_url: string;
  short_name: string;
  score: number;
  dungeon: string;
};

type MythicProps = {
  bestMythics: Mythic[];
};

export default function TeamBestMythicDisplay({ bestMythics }: MythicProps) {
    console.log(bestMythics);
  return (
    <>
            {bestMythics.map((run) => (
                
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
    <div className="bg-[#222222] rounded-lg overflow-hidden">
      <div className="relative h-28">
        <img src={"https://placehold.co/400"} alt={"name"} className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#222222] via-[#22222299] to-transparent"></div>

        <div className="absolute top-2 left-3">
          <h3 className="font-bold text-white">{run.dungeon}</h3>
        </div>

        <div className="absolute bottom-2 left-3 right-3">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="font-bold mr-2">Score:</span>
                {/* <span className={`font-bold text-xl ${getScoreColor(score)}`}>{score}</span> */}
              </div>
              {/* <div className="text-xs text-gray-300">
                Time: {time} / {timeLimit} ({percentage})
              </div> */}
            </div>

            {/* {stars > 0 && (
              <div className="flex">
                {[...Array(stars)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
      ))}
    </>
  );
}
