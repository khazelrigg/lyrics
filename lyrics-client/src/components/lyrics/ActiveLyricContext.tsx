"use client";

import { createContext, useContext } from "react";

type ActiveLyricContextValue = {
  activeIndex: number;
  activeStartTimeMs: number | null;
};

const ActiveLyricContext = createContext<ActiveLyricContextValue>({
  activeIndex: -1,
  activeStartTimeMs: null,
});

export function ActiveLyricProvider({
  value,
  children,
}: {
  value: ActiveLyricContextValue;
  children: React.ReactNode;
}) {
  return (
    <ActiveLyricContext.Provider value={value}>
      {children}
    </ActiveLyricContext.Provider>
  );
}

export function useActiveLyricContext() {
  return useContext(ActiveLyricContext);
}