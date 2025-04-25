import { makeTeams } from "@/lib/teams";
import { usePlayers } from "@/lib/usePlayers";
import { useEffect } from "react";

export function TeamTable() {
  const { players } = usePlayers();
  useEffect(() => {
    console.log(makeTeams(players));
  }, []);

  return null;
}
