import { createContext, useContext, useRef, type ReactNode } from 'react';
import { AuthStore } from './authStore';
import { ScheduleStore } from './scheduleStore';

export class RootStore {
  readonly authStore = new AuthStore();
  readonly scheduleStore = new ScheduleStore();

  constructor() {
    this.scheduleStore.bootstrapMockData();
  }
}

const StoreContext = createContext<RootStore | null>(null);

interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider = ({ children }: StoreProviderProps) => {
  const storeRef = useRef<RootStore>();

  if (!storeRef.current) {
    storeRef.current = new RootStore();
  }

  return <StoreContext.Provider value={storeRef.current}>{children}</StoreContext.Provider>;
};

export function useStores() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('StoreProvider is missing in the component tree');
  }
  return context;
}

export const useAuthStore = () => useStores().authStore;
export const useScheduleStore = () => useStores().scheduleStore;
