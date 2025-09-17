import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationHeightContextType {
  height: number;
  setHeight: (height: number) => void;
}

const NavigationHeightContext = createContext<NavigationHeightContextType>({
  height: 0,
  setHeight: () => {},
});

export const useNavigationHeight = () => {
  const context = useContext(NavigationHeightContext);
  if (!context) {
    throw new Error('useNavigationHeight must be used within NavigationHeightProvider');
  }
  return context;
};

interface NavigationHeightProviderProps {
  children: ReactNode;
}

export const NavigationHeightProvider: React.FC<NavigationHeightProviderProps> = ({ children }) => {
  const [height, setHeight] = useState(0);

  return (
    <NavigationHeightContext.Provider value={{ height, setHeight }}>
      {children}
    </NavigationHeightContext.Provider>
  );
};