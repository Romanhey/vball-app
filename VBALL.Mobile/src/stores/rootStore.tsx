import { createContext, useContext, useRef, useEffect, type ReactNode } from 'react';
import { AuthStore } from './authStore';

export class RootStore {
  readonly authStore = new AuthStore();
}

const StoreContext = createContext<RootStore | null>(null);

interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider = ({ children }: StoreProviderProps) => {
  const storeRef = useRef<RootStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = new RootStore();
  }

  useEffect(() => {
    storeRef.current?.authStore.init();
  }, []);

  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  );
};

export function useStores(): RootStore {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('StoreProvider is missing in the component tree');
  }
  return context;
}

export const useAuthStore = () => useStores().authStore;
