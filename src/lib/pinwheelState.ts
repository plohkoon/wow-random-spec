import { useCallback, useSyncExternalStore } from "react";
import { PlayerType } from "./usePlayers";

class PinwheelState {
  open: boolean = false;
  subscribers: (() => void)[] = [];

  currentPlayerData: PlayerType | null = null;
  currentRollList: string[] | null = null;
  currentCallback: ((r: string) => void) | null = null;

  subscribe(cb: () => void) {
    this.subscribers.push(cb);
  }

  unsubscribe(cb: () => void) {
    this.subscribers.filter((s) => s !== cb);
  }

  notify() {
    this.subscribers.forEach((s) => s());
  }

  roll(
    playerData: PlayerType,
    rollList: string[],
    callback: (r: string) => void
  ) {
    this.currentPlayerData = playerData;
    this.currentRollList = rollList;
    this.currentCallback = callback;

    this.open = true;

    this.notify();
  }

  respond(value: string) {
    this.currentCallback?.(value);

    this.currentPlayerData = null;
    this.currentRollList = null;
    this.currentCallback = null;

    this.open = false;

    this.notify();
  }

  close() {
    this.open = false;
    this.currentPlayerData = null;
    this.currentRollList = null;
    this.currentCallback = null;

    this.notify();
  }
}

const pinwheelState = new PinwheelState();

export function usePinwheelState() {
  const open = useSyncExternalStore(
    (cb) => {
      pinwheelState.subscribe(cb);
      return () => pinwheelState.unsubscribe(cb);
    },
    () => pinwheelState.open
  );

  const items = useSyncExternalStore(
    (cb) => {
      pinwheelState.subscribe(cb);
      return () => pinwheelState.unsubscribe(cb);
    },
    () => pinwheelState.currentRollList
  );

  const roll = useCallback(
    (
      playerData: PlayerType,
      rollList: string[],
      callback: (r: string) => void
    ) => pinwheelState.roll(playerData, rollList, callback),
    []
  );

  const respond = useCallback(
    (value: string) => pinwheelState.respond(value),
    []
  );

  const close = useCallback(() => pinwheelState.close(), []);

  return {
    open,
    roll,
    respond,
    items: items || [],
    close,
  } as const;
}
