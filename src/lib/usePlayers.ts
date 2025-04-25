import { useCallback, useMemo, useSyncExternalStore } from "react";

export type PlayerType = {
  id: number;
  name: string;
  score: number;
  main: string;
  role: string;
  rolledSpec?: string;
  team?: string;
};

class PlayerState {
  players: PlayerType[] = [];
  notifiers: (() => void)[] = [];

  constructor() {
    const value = window.localStorage.getItem("players");
    if (value) {
      this.players = JSON.parse(value) as PlayerType[];
    }
  }

  notify() {
    this.notifiers.forEach((n) => n());
    window.dispatchEvent(new Event("storage"));
  }

  subscribe(cb: () => void) {
    this.notifiers.push(cb);
    window.addEventListener("storage", cb);
  }

  unsubscribe(cb: () => void) {
    this.notifiers = this.notifiers.filter((n) => n !== cb);
    window.removeEventListener("storage", cb);
  }

  setPlayers(players: PlayerType[]) {
    this.players = [...players];
    window.localStorage.setItem("players", JSON.stringify(players));

    this.notify();
  }

  updatePlayer(id: number, newPlayer: Partial<PlayerType>) {
    const player = this.players.find((p) => p.id === id);
    if (player) {
      Object.assign(player, newPlayer);
      this.setPlayers(this.players);
    }
  }

  deletePlayer(id: number) {
    console.log(this.players, id);
    this.players = this.players.filter((p) => p.id !== id);
    this.setPlayers(this.players);
  }

  addPlayer(newPlayer: Omit<PlayerType, "id">) {
    console.log("Adding player", newPlayer);

    const newId = Math.max(...this.players.map((p) => p.id + 1));

    const newPlayers = [
      ...this.players,
      {
        id: newId,
        ...newPlayer,
      },
    ];
    this.setPlayers(newPlayers);
  }
}

const playerState = new PlayerState();

export function usePlayers() {
  const players = useSyncExternalStore(
    (onStoreChange) => {
      playerState.subscribe(onStoreChange);
      return () => playerState.unsubscribe(onStoreChange);
    },
    () => playerState.players,
    () => playerState.players
  );

  const teams = useMemo(() => {
    return players.reduce((acc, player) => {
      if (player.team) {
        if (!acc[player.team]) {
          acc[player.team] = [];
        }
        acc[player.team].push(player);
      } else {
        if (!acc["rest"]) {
          acc["rest"] = [];
        }
        acc["rest"].push(player);
      }

      return acc;
    }, {} as Record<string, PlayerType[]>);
  }, [players]);

  const setPlayers = useCallback(
    (newPlayers: PlayerType[]) => playerState.setPlayers(newPlayers),
    []
  );
  const updatePlayer = useCallback(
    (id: number, newPlayer: Partial<PlayerType>) =>
      playerState.updatePlayer(id, newPlayer),
    []
  );
  const deletePlayer = useCallback(
    (id: number) => playerState.deletePlayer(id),
    []
  );
  const addPlayer = useCallback(
    (newPlayer: Omit<PlayerType, "id">) => playerState.addPlayer(newPlayer),
    []
  );

  return {
    players,
    setPlayers,
    updatePlayer,
    deletePlayer,
    addPlayer,
    teams,
  } as const;
}
