import { ScoreDisplay } from "../display/scoreDisplay";

type MythicProps = {
    bestMythics: any;
}

export default function MythicDisplay ({
    bestMythics = [],
}: MythicProps) {
    console.log(bestMythics)
    return (
        <>
        
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                        {bestMythics.map((mythic: any) => (
                            <div className="bg-gray-900 rounded p-2 flex flex-col items-center">
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
            {/* <div className="bg-gray-900 rounded p-2 flex flex-col items-center">
              <span className="text-xs text-gray-500">ROOK</span>
              <span className="text-lg font-medium text-green-400">177.6</span>
            </div>
            <div className="bg-gray-900 rounded p-2 flex flex-col items-center">
              <span className="text-xs text-gray-500">WORK</span>
              <span className="text-lg font-medium text-green-400">175.8</span>
            </div>
            <div className="bg-gray-900 rounded p-2 flex flex-col items-center">
              <span className="text-xs text-gray-500">ML</span>
              <span className="text-lg font-medium text-green-400">162.2</span>
            </div>
            <div className="bg-gray-900 rounded p-2 flex flex-col items-center">
              <span className="text-xs text-gray-500">PSF</span>
              <span className="text-lg font-medium text-green-400">160.1</span>
            </div>
            <div className="bg-gray-900 rounded p-2 flex flex-col items-center">
              <span className="text-xs text-gray-500">FLOOD</span>
              <span className="text-lg font-medium text-green-400">158.5</span>
            </div>
            <div className="bg-gray-900 rounded p-2 flex flex-col items-center">
              <span className="text-xs text-gray-500">DFC</span>
              <span className="text-lg font-medium text-green-400">157.6</span>
            </div>
            <div className="bg-gray-900 rounded p-2 flex flex-col items-center">
              <span className="text-xs text-gray-500">TOP</span>
              <span className="text-lg font-medium text-green-400">157.2</span>
            </div> */}
          </div>
        </>
    )
}