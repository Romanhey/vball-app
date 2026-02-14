import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

interface BottomAdminPanelContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const BottomAdminPanelContext =
  createContext<BottomAdminPanelContextValue | null>(null);

export function BottomAdminPanelProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  const value: BottomAdminPanelContextValue = {
    isOpen,
    open,
    close,
    toggle,
  };

  return (
    <BottomAdminPanelContext.Provider value={value}>
      {children}
    </BottomAdminPanelContext.Provider>
  );
}

export function useBottomAdminPanel(): BottomAdminPanelContextValue {
  const ctx = useContext(BottomAdminPanelContext);
  if (!ctx) {
    throw new Error(
      'useBottomAdminPanel must be used within BottomAdminPanelProvider'
    );
  }
  return ctx;
}
