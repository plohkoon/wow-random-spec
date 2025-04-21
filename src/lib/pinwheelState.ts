import { useSyncExternalStore } from "react";

class PinwheelState {
  open: boolean = true;
  subscribers: (() => void)[] = [];

  constructor() {
    this.open = true;
    this.subscribers = [];
  }

  subscribe(cb: () => void) {
    this.subscribers.push(cb);
  }

  unsubscribe(cb: () => void) {
    this.subscribers.filter((s) => s !== cb);
  }

  notify() {
    this.subscribers.forEach((s) => s());
  }
}

const pinwheelState = new PinwheelState();

export function usePinwheelState() {
  const { open } = useSyncExternalStore(
    (cb) => {
      pinwheelState.subscribe(cb);

      return () => pinwheelState.unsubscribe(cb);
    },
    () => pinwheelState,
    () => pinwheelState
  );

  return {
    open,
  };
}
