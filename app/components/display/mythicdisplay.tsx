import { CharacterNS } from "~/lib/raiderIO/characters";
import { ScoreDisplay } from "../display/scoreDisplay";

type MythicProps = {
  bestMythics: CharacterNS.MythicPlusRun[];
};

export default function MythicDisplay({ bestMythics = [] }: MythicProps) {
  return (
    <>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {bestMythics.map((mythic) => (
          <div
            className="bg-gray-900 rounded p-2 flex flex-col items-center"
            key={mythic.keystone_run_id}
          >
            <li
              key={mythic.keystone_run_id}
              className="relative h-16 w-16 rounded overflow-hidden"
            >
              {/* Background image */}
              <img
                src={mythic.icon_url}
                alt={mythic.short_name}
                className="absolute inset-0 h-full w-full object-cover opacity-30"
              />

              {/* Foreground content */}
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
