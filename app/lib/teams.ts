export function organizeTeams<
  T extends { players: { assignedRole: string | null }[] }
>(teams: T[]): T[] {
  const newTeams = teams.map((team) => {
    return {
      ...team,
      players: team.players.sort((a, b) => {
        const aNum =
          {
            tank: 0,
            healer: 1,
            rdps: 2,
            mdps: 3,
            dps: 4,
          }[a.assignedRole ?? ""] ?? 5;
        const bNum =
          {
            tank: 0,
            healer: 1,
            rdps: 2,
            mdps: 3,
            dps: 4,
          }[b.assignedRole ?? ""] ?? 5;

        return aNum - bNum;
      }),
    };
  });

  return newTeams;
}
