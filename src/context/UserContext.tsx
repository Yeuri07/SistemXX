import React, { createContext, useContext, useState } from 'react';

interface UserContextType {
  profilePicture: string | null;
  updateProfilePicture: (url: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const updateProfilePicture = (url: string) => {
    setProfilePicture(url);
  };

  return (
    <UserContext.Provider value={{ profilePicture, updateProfilePicture }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};