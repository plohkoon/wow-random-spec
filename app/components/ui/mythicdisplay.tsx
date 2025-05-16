import { ScoreDisplay } from "../display/scoreDisplay";

type Mythic = {
  keystone_run_id: string | number;
  icon_url: string;
  short_name: string;
  score: number;
};

type MythicProps = {
  bestMythics: Mythic[];
};

export default function MythicDisplay({ bestMythics }: MythicProps) {
  return (
    <>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
        {bestMythics.map((mythic: any) => (
          <div
            key={mythic.keystone_run_id}
            className="bg-stone-300 dark:bg-[#1E1E1E] rounded p-2 flex flex-col items-center"
          >
            <div className="relative h-16 w-full rounded overflow-hidden bg-cover bg-center">
              <img
                src={mythic.background_image_url}
                alt={mythic.short_name}
                className="absolute inset-0 h-full w-full object-cover opacity-30"
              />
              <div className="relative z-10 flex flex-col items-center justify-center h-full w-full text-white text-center">
                <ScoreDisplay
                  score={mythic.score}
                  individual
                  className="text-xl font-bold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
                />
                <h5 className="text-black dark:text-white text-xs">
                  {mythic.short_name}
                </h5>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
