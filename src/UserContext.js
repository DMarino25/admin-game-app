import React, { createContext, useState, useContext, useEffect } from "react";

// Create the context
const UserContext = createContext();

// Custom hook to use the user context
export const useUser = () => useContext(UserContext);

// Create a provider to wrap the app with
export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(() => {
    return localStorage.getItem("userId") || null;
  });

  const [peerUserId, setPeerUserId] = useState(() => {
    return localStorage.getItem("peerUserId") || null;
  });

  // Save userId to localStorage whenever it changes
  useEffect(() => {
    if (userId) {
      localStorage.setItem("userId", userId);
    } else {
      localStorage.removeItem("userId");
    }
  }, [userId]);

  // Save peerUserId to localStorage whenever it changes
  useEffect(() => {
    if (peerUserId) {
      localStorage.setItem("peerUserId", peerUserId);
    } else {
      localStorage.removeItem("peerUserId");
    }
  }, [peerUserId]);

  // Function to set the userId
  const setUserData = (id) => {
    setUserId(id);
  };

  // Function to set the peer user's ID for chat
  const setPeerData = (peerId) => {
    setPeerUserId(peerId);
  };

  return (
    <UserContext.Provider value={{ userId, peerUserId, setUserData, setPeerData }}>
      {children}
    </UserContext.Provider>
  );
};