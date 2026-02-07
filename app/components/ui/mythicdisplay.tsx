import { Link } from "react-router";
import { ScoreDisplay } from "../display/scoreDisplay";
import type { MythicData } from "~/lib/mythics";

type MythicProps = {
  bestMythics: MythicData[];
};

function getParticipantBadgeClass(count: number): string {
  if (count >= 5) return "bg-green-700/80";
  if (count <= 3) return "bg-amber-700/80";
  return "bg-black/60";
}

export default function MythicDisplay({ bestMythics }: MythicProps) {
  return (
    <>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
        {bestMythics.map((mythic) => (
          <Link to={mythic.url} target="_blank" key={mythic.keystone_run_id}>
            <div
              key={mythic.keystone_run_id}
              className="bg-stone-300 dark:bg-[#1E1E1E] rounded-lg p-1.5 flex flex-col items-center group"
            >
              <div className="relative h-16 w-full rounded overflow-hidden bg-cover bg-center">
                <div className="absolute inset-0 h-full w-full transition-transform duration-300 ease-in-out transform group-hover:scale-110">
                  <img
                    src={mythic.background_image_url}
                    alt={mythic.short_name}
                    className="h-full w-full object-cover opacity-30"
                  />
                </div>
                <div className="relative z-10 flex flex-col items-center justify-center h-full w-full text-white text-center">
                  <ScoreDisplay
                    score={mythic.score}
                    individual
                    className="text-xl font-bold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
                  />
                  <h5 className="text-black dark:text-white text-xs">
                    +{mythic.mythic_level} {mythic.short_name}
                  </h5>
                </div>
                <span
                  className={`absolute top-0.5 right-0.5 z-20 text-[10px] font-semibold text-white px-1 py-0.5 rounded ${getParticipantBadgeClass(mythic.participants.length)}`}
                >
                  {mythic.participants.length}/5
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
