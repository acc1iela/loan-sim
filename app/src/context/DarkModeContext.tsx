import { createContext, useContext } from 'react';

interface DarkModeContextValue {
  isDark: boolean;
  toggle: () => void;
}

export const DarkModeContext = createContext<DarkModeContextValue | null>(null);

export function useDarkModeContext(): DarkModeContextValue {
  const ctx = useContext(DarkModeContext);
  if (!ctx) throw new Error('useDarkModeContext must be used within DarkModeContext.Provider');
  return ctx;
}
