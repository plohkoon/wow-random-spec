import { Sword, ChevronDown, ChevronUp, User } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { useState } from "react";
import { IlvlDisplay } from "~/components/display/ilvlDisplay";

// type Equipment = {
//   items: string[];
//   name: string;
//   item_level: number;
// };

// type EquipmentProps = {
//   objectKeys: Equipment[];
// };
const SLOT_LABELS: Record<string, string> = {
  head: "Head",
  neck: "Neck",
  shoulder: "Shoulder",
  back: "Back",
  chest: "Chest",
  wrist: "Wrist",
  hands: "Hands",
  waist: "Waist",
  legs: "Legs",
  feet: "Feet",
  finger1: "Ring 1",
  finger2: "Ring 2",
  trinket1: "Trinket 1",
  trinket2: "Trinket 2",
  mainhand: "Main Hand",
  off_hand: "Off Hand",
  two_hand: "Two-Handed",
};

export default function EquipmentData({ objectKeys, gear }: any) {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <>
      <Card className="border-neutral-300 dark:border-black-two bg-neutral-300 dark:bg-black-bg shadow-2xl">
        <CardHeader className="border-b border-white/20 flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold text-[#FFD166] flex items-center drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
            <Sword className="mr-2 h-5 w-5" />
            Equipment
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
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {objectKeys.map((key: string) => {
                const item = gear.items[key];
                if (!item) return null;
                return (
                  <a
                    href={`https://www.wowhead.com/item=${item.item_id}`}
                    target="_blank"
                  >
                    <div
                      key={key}
                      className="flex items-center p-3 text-white dark:text-black rounded-md bg-neutral-400 dark:bg-[#555555] hover:bg-[#666666] transition-colors"
                    >
                      <div className="flex-shrink-0 mr-3 relative">
                        <div className="w-10 h-10 rounded border border-[#A0E7A0] overflow-hidden bg-black">
                          {/* This works but we don't wanna get in trouble lmao */}
                          {/* <img src={`https://cdn.raiderio.net/images/wow/icons/large/${item.icon}.jpg`} /> */}

                          {/* <img
                          src={item.icon || "/placeholder.svg"}
                          alt={item.name}
                          width={40}
                          height={40}
                          className="object-cover"
                        /> */}
                          <Sword className="mx-auto text-white" height={36} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate dark:text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                          {item.name}
                        </p>
                        <span className="text-xs text-black dark:text-gray-400">
                          {SLOT_LABELS[key] ?? key}
                        </span>
                      </div>
                      <div className="flex-shrink-0">
                        <Badge className="bg-dark-brown dark:bg-black-light text-gray-400 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                          <IlvlDisplay
                            ilvl={item.item_level}
                            className="drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
                          />
                        </Badge>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </CardContent>
        </div>
      </Card>
    </>
  );
};
