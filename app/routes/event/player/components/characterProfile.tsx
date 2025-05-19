import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ExternalLink, Heart, Shield, Sword, User, Zap } from "lucide-react";
import { ClassDisplay } from "~/components/display/classDisplay";
import { IlvlDisplay } from "~/components/display/ilvlDisplay";
import { RoleDisplay } from "~/components/display/roleDisplay";
import { ScoreDisplay } from "~/components/display/scoreDisplay";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { makeRaiderIOClassSpec } from "~/lib/classes";

export default function CharacterProfile({ character, score }: any) {
  return (
    <Card className="border-neutral-300 dark:border-black-two bg-neutral-300 dark:bg-black-bg shadow-2xl">
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start px-4">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gold-yellow bg-[#444444] shadow-2xl">
            <img
              src={character.thumbnail_url || <User />}
              alt={character.name}
              width={128}
              height={128}
              className="object-cover"
            />
          </div>
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <CardTitle className="text-3xl font-bold text-gold-yellow drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
              {character.name}
            </CardTitle>
            <Badge className="self-center md:self-auto bg-black-two text-white">
              {character.race}
              <ClassDisplay
                classSpec={makeRaiderIOClassSpec(
                  character.class,
                  character.active_spec_name
                )}
              />
            </Badge>
          </div>
          <CardDescription className="text-gray-300 mt-1 flex justify-center lg:justify-start md:justify-start xl:justify-start">
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#4ECDC4]" />
                <span className="font-medium text-black dark:text-white">
                  Role:
                </span>
                <RoleDisplay
                  playerRole={character.active_spec_role.toLowerCase()}
                />
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-gold-yellow" />
                <span className="font-medium text-black dark:text-white">
                  Score:
                  <ScoreDisplay
                    score={score}
                    className="drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
                  />
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-[#FF6B6B]" />
                <span className="font-medium text-black dark:text-white">
                  Item Level:
                  <IlvlDisplay ilvl={character.gear.item_level_equipped} />
                  {character.item_level_equipped}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Sword className="h-5 w-5 text-white" />
                <span className="font-medium text-black dark:text-white">
                  Main: <ClassDisplay classSpec={character.player.main} />
                </span>
              </div>
            </div>
          </CardDescription>
          <div className="mt-4">
            <Button
              asChild
              variant="outline"
              className="border-black text-black dark:text-white bg-neutral-300 hover:bg-[#4ECDC4]/10"
            >
              <a
                href={character.profile_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View on Raider.IO
              </a>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
