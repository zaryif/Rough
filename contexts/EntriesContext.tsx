
import React, { createContext, useContext } from 'react';
import { useEntries } from '../hooks/useEntries';
import { Entry } from '../types';

type EntriesContextType = ReturnType<typeof useEntries>;

const EntriesContext = createContext<EntriesContextType | null>(null);

export const EntriesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const entriesData = useEntries();
  return (
    <EntriesContext.Provider value={entriesData}>
      {children}
    </EntriesContext.Provider>
  );
};

export const useEntriesContext = (): EntriesContextType => {
  const context = useContext(EntriesContext);
  if (!context) {
    throw new Error('useEntriesContext must be used within an EntriesProvider');
  }
  return context;
};
