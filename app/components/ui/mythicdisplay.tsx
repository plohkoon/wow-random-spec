import { ScoreDisplay } from "../display/scoreDisplay";

type MythicProps = {
  bestMythics: any;
};

export default function MythicDisplay({ bestMythics }: MythicProps) {
  console.log(bestMythics);
  return (
    <>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
        {bestMythics.map((mythic: any) => (
          <div className="bg-gray-900 rounded p-2 flex flex-col items-center">
            <li
              key={mythic.keystone_run_id}
              className="relative h-16 w-16 rounded overflow-hidden bg-cover bg-center"
            >
              <img
                src={mythic.icon_url}
                alt={mythic.short_name}
                className="absolute inset-0 h-full w-full object-cover opacity-30"
              />
              <div className="relative z-10 flex flex-col items-center justify-center h-full w-full text-white text-center">
                <ScoreDisplay
                  score={mythic.score}
                  individual
                  className="text-xl font-bold"
                />
                <h5 className="text-xs">{mythic.short_name}</h5>
              </div>
            </li>
          </div>
        ))}
      </div>
    </>
  );
}
