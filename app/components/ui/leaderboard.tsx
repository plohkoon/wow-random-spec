import { useState } from "react"
import { ChevronDown, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function Leaderboard2() {
  const [sortBy, setSortBy] = useState("Team Score")

  return (
    <div className="w-full max-w-7xl mx-auto bg-black text-white p-6 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Season 1</h1>
          <Button variant="outline" size="sm" className="text-xs h-7 px-2 border-gray-700 text-gray-300">
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
              <DropdownMenuItem onClick={() => setSortBy("Mythic Ran")}>Mythic Ran</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("Team Score")}>Team Score</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("Best Single Score")}>Best Single Score</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("Most Under Par")}>Most Under Par</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("Unsorted")}>Unsorted</DropdownMenuItem>
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
                Team 5
              </h2>
              <div className="flex items-center gap-3">
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
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center justify-center">
              <span className="text-gray-400 text-sm mb-1">Mythics Ran</span>
              <span className="text-3xl font-bold">9</span>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center justify-center">
              <span className="text-gray-400 text-sm mb-1">Team Score</span>
              <span className="text-3xl font-bold text-green-400">1,149.8</span>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center justify-center">
              <span className="text-gray-400 text-sm mb-1">Single Score</span>
              <span className="text-3xl font-bold text-green-400">177.6</span>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center justify-center">
              <span className="text-gray-400 text-sm mb-1">Under Par</span>
              <span className="text-3xl font-bold text-red-400">-20.21%</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            <div className="bg-gray-900 rounded p-2 flex flex-col items-center">
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
            </div>
          </div>
        </div>

        {/* You can add more team entries here following the same pattern */}
      </div>
    </div>
  )
}
