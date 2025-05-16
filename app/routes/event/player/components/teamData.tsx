import { ChevronDown, ChevronUp, Heart, Shield, Sword } from "lucide-react";
import { useState } from "react";
import { ClassDisplay } from "~/components/display/classDisplay";
import { RoleDisplay } from "~/components/display/roleDisplay";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle } from "~/components/ui/card";
import { MythicData } from "~/lib/mythics";

//func to get icon for team list depending on spec
const getRoleIcon = (role: string) => {
  switch (role) {
    case "tank":
      return <Shield className="h-4 w-4 text-[#4ECDC4]" />;
    case "healer":
      return <Heart className="h-4 w-4 text-[#A0E7A0]" />;
    case "rdps":
    case "mdps":
      return <Sword className="h-4 w-4 text-[#FF6B6B]" />;
    default:
      return <Shield className="h-4 w-4 text-gray-400" />;
  }
};

export default function TeamData({
  player,
  mythicData,
}: {
  player: any;
  mythicData: MythicData[] | null;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <Card className="border-neutral-300 dark:border-black-two bg-neutral-300 dark:bg-black-bg shadow-2xl">
      <CardHeader className="border-b border-white/20 flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold text-[#FFD166] flex items-center drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
          <Shield className="mr-2 h-5 w-5" />
          Team Roster
        </CardTitle>
        {/* Only show collapse button on mobile */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-white hover:text-light-blue hover:bg-neutral-400 dark:hover:bg-black-two lg:hidden"
        >
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-black dark:text-white" />
          ) : (
            <ChevronDown className="h-5 w-5 text-black dark:text-white" />
          )}
        </Button>
      </CardHeader>

      {/* Always show content on desktop, respect isExpanded on mobile */}
      <div
        className={`${
          !isExpanded ? "hidden lg:block" : "block"
        } transition-all duration-300 ease-in-out`}
      >
        <div className="flex">
          <h2 className="mx-auto text-lg md:text-lg lg:text-2xl -mt-6 mb-4 underline decoration-3 decoration-white dark:decoration-light-brown font-bold flex items-center gap-2 overflow-hidden whitespace-nowrap">
            {player.team.name}
          </h2>
        </div>
        {player.team.players.map((member: any) => (
          <div
            key={member.id}
            className="flex items-center p-3 rounded-md bg-[#555555] hover:bg-[#666666] transition-colors mb-2"
          >
            <div className="flex-shrink-0 mr-4 relative">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#FF6B6B] bg-[#444444]">
                <img
                  src={member.avatar || "/placeholder.svg"}
                  alt={member.name}
                  width={50}
                  height={50}
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#444444]">
                {getRoleIcon(member.assignedRole)}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center">
                <h3 className="text-lg font-semibold">{member.playerName}</h3>
                {/* <Badge className={`ml-2 text-xs ${getClassColor(member.class)} text-black`}>{member.class}</Badge> */}
              </div>
              <RoleDisplay
                className="text-xs"
                playerRole={member.assignedRole.toLowerCase()}
              />
            </div>

            <div className="flex-shrink-0">
              <ClassDisplay classSpec={member.spec}></ClassDisplay>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
