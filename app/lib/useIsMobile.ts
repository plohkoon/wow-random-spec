import { useSyncExternalStore } from "react";

export function useIsMobile(breakpoint = 768) {
  const isMobile = useSyncExternalStore(
    (callback) => {
      window.addEventListener("resize", callback);
      return () => window.removeEventListener("resize", callback);
    },
    () => window.innerWidth < breakpoint,
    () => false
  );

  return isMobile;
}
