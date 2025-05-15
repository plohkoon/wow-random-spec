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
          <span className="text-sm text-gray-400 mr-2">Sort By:</span>
        </div>
      </div>
      <div className="space-y-4">
        <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-800">
          <div className="absolute -top-3 -left-3 bg-amber-500 text-black font-bold rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-lg">
            1
          </div>
          <div className="mb-8">
            <div className="flex justify-center mb-2">
              <h2 className="text-3xl underline decoration-3 decoration-light-red font-bold flex items-center gap-2">
                <Users className="h-6 w-6 text-gray-400" />
                <Link to={`/event/${slug}/team/${team.id}`}>{team.name}</Link>
              </h2>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {team.players.map((player: any) => (
                <Link key={player.id} to={`/event/${slug}/player/${player.id}`}>
                  <PlayerShortDisplay
                    player={player}
                    className="text-md before:w-4 before:h-4 underline"
                  />
                </Link>
              ))}
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
              <span className="text-3xl font-bold">
                {bestSingleScore}
              </span>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center justify-center">
              <span className="text-gray-400 text-sm mb-1">Under Par</span>
              <span className="text-3xl font-bold">
                {(mostUnderTime * 100).toFixed(2)}
              </span>
            </div>
          </div>
          <MythicDisplay bestMythics={bestMythics} />
        </div>
      </div>
    </div>
  );
}


          {/* <DropdownMenu>
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
          </DropdownMenu> */}