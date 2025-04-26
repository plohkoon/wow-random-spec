import { useEffect, useSyncExternalStore } from "react";

class DarkMode {
  subscribers = new Set<() => void>();

  get isDarkMode() {
    const v = window?.localStorage?.getItem("darkmode");
    if (v === "true") {
      return true;
    } else if (v === "false") {
      return false;
    } else {
      return window?.matchMedia("(prefers-color-scheme: dark)").matches;
    }
  }

  set isDarkMode(v: boolean) {
    if (v) {
      window.localStorage.setItem("darkmode", "true");
      document.documentElement.classList.add("dark");
    } else {
      window.localStorage.setItem("darkmode", "false");
      document.documentElement.classList.remove("dark");
    }
    this.subscribers.forEach((s) => s());
  }

  subscribe(cb: () => void) {
    this.subscribers.add(cb);
  }

  unsubscribe(cb: () => void) {
    this.subscribers.delete(cb);
  }
}

const darkModeWatcher = new DarkMode();

export function useDarkMode() {
  const isDarkMode = useSyncExternalStore(
    (cb) => {
      darkModeWatcher.subscribe(cb);
      return () => darkModeWatcher.unsubscribe(cb);
    },
    () => darkModeWatcher.isDarkMode,
    () => darkModeWatcher.isDarkMode
  );

  const setDarkMode = (v: boolean) => {
    darkModeWatcher.isDarkMode = v;
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, []);

  return {
    isDarkMode,
    setDarkMode,
  } as const;
}
