import React from 'react';
import { useSettingsContext } from '../contexts/SettingsContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, customBackground } = useSettingsContext();

  return (
    <div className="w-screen h-screen bg-white dark:bg-black flex flex-col overflow-hidden relative">
      {customBackground && (
        <>
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center z-0"
            style={{ backgroundImage: `url(${customBackground})` }}
          />
          <div className={`absolute inset-0 w-full h-full z-0 ${theme === 'dark' ? 'bg-black/60' : 'bg-white/60'}`} />
        </>
      )}
      <div className="relative z-10 flex flex-col flex-grow h-full">
        {children}
      </div>
    </div>
  );
};

export default Layout;