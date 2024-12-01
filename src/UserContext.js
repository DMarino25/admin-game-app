import React, { createContext, useState, useContext } from 'react';

// Create the context
const UserContext = createContext();

// Custom hook to use the user context
export const useUser = () => useContext(UserContext);

// Create a provider to wrap the app with
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [peerUserId, setPeerUserId] = useState(null); // Store peer user's ID

  // Function to set user data
  const setUserData = (userData) => {
    setUser(userData);
  };

  // Function to set the peer user's ID for chat
  const setPeerData = (peerId) => {
    setPeerUserId(peerId); // Store the peer user's ID (chat partner)
  };
  
  return (
    <UserContext.Provider value={{ user, peerUserId, setUserData, setPeerData }}>
      {children}
    </UserContext.Provider>
  );
};
