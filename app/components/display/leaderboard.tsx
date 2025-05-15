import { useState } from "react";
import { ChevronDown, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router";
import { PlayerShortDisplay } from "../display/playerShortDisplay";
import MythicDisplay from "./mythicdisplay";

type LeaderboardNewProps = {
  team: any;
  slug?: string;
  mythics: any;
  bestMythics: any;
  bestMythicsScore: number;
  mostUnderTime: number;
  bestSingleScore: number;
};

export default function LeaderboardNew({
  team,
  mythics,
  bestMythicsScore,
  bestMythics,
  bestSingleScore,
  mostUnderTime,
  slug,
}: LeaderboardNewProps) {
  const [sortBy, setSortBy] = useState("Team Score");
  
  return (
    <div className="w-full max-w-7xl mx-auto bg-black text-white p-6 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Season 1</h1>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7 px-2 border-gray-700 text-gray-300"
          >
            View Lists &gt;
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400 mr-2">Sort By:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-gray-700 bg-gray-900">
                {sortBy} <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="bottom"
              align="end"
              className="z-50 bg-gray-900 border border-gray-700 mt-1 min-w-[180px]"
            >
              <DropdownMenuItem onClick={() => setSortBy("Mythic Ran")}>
                Mythic Ran
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("Team Score")}>
                Team Score
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("Best Single Score")}>
                Best Single Score
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("Most Under Par")}>
                Most Under Par
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("Unsorted")}>
                Unsorted
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-800">
          <div className="absolute -top-3 -left-3 bg-amber-500 text-black font-bold rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-lg">
            1
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center">
                <Users className="mr-2 h-6 w-6 text-gray-400" />
                <Link to={`/event/${slug}/team/${team.id}`}>{team.name}</Link>
              </h2>
              {team.players.map((player: any) => (
                <Link to={`/event/${slug}/player/${player.id}`} key={player.id}>
                  <PlayerShortDisplay
                    key={player.id}
                    player={player}
                    className="text-xl font-bold before:w-8 before:h-8 underline"
                  />
                </Link>
              ))}

              {/* <div className="flex items-center gap-3">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-emerald-700 flex items-center justify-center text-xs border-2 border-gray-800 mr-2">
                    S
                  </div>
                  <span className="text-emerald-400 text-sm">Sanzusi</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-emerald-700 flex items-center justify-center text-xs border-2 border-gray-800 mr-2">
                    T
                  </div>
                  <span className="text-emerald-400 text-sm">Tito</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-emerald-700 flex items-center justify-center text-xs border-2 border-gray-800 mr-2">
                    M
                  </div>
                  <span className="text-emerald-400 text-sm">Mulberry</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-amber-700 flex items-center justify-center text-xs border-2 border-gray-800 mr-2">
                    TR
                  </div>
                  <span className="text-amber-400 text-sm">TR</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-rose-700 flex items-center justify-center text-xs border-2 border-gray-800 mr-2">
                    M
                  </div>
                  <span className="text-rose-400 text-sm">Myntt</span>
                </div>
              </div> */}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center justify-center">
              <span className="text-gray-400 text-sm mb-1">Mythics Ran</span>
              <span className="text-3xl font-bold">{mythics.length ?? 0}</span>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center justify-center">
              <span className="text-gray-400 text-sm mb-1">Team Score</span>
              <span className="text-3xl font-bold text-green-400">
                {bestMythicsScore}
              </span>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center justify-center">
              <span className="text-gray-400 text-sm mb-1">Single Score</span>
              <span className="text-3xl font-bold text-green-400">
                {bestSingleScore}
              </span>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center justify-center">
              <span className="text-gray-400 text-sm mb-1">Under Par</span>
              <span className="text-3xl font-bold text-red-400">
                {(mostUnderTime * 100).toFixed(2)}
              </span>
            </div>
          </div>
          <MythicDisplay bestMythics={bestMythics}/>


        </div>

        {/* You can add more team entries here following the same pattern */}
      </div>
    </div>
  );
}
