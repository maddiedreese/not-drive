import React, { createContext, useContext, useState } from 'react';

interface CrazyModeContextType {
  crazyMode: boolean;
  toggleCrazyMode: () => void;
}

const CrazyModeContext = createContext<CrazyModeContextType | undefined>(undefined);

export const useCrazyMode = () => {
  const context = useContext(CrazyModeContext);
  if (context === undefined) {
    throw new Error('useCrazyMode must be used within a CrazyModeProvider');
  }
  return context;
};

export const CrazyModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [crazyMode, setCrazyMode] = useState(false);

  const toggleCrazyMode = () => {
    setCrazyMode(prev => !prev);
  };

  return (
    <CrazyModeContext.Provider value={{ crazyMode, toggleCrazyMode }}>
      {children}
    </CrazyModeContext.Provider>
  );
};