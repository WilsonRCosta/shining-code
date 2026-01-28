import React, { createContext, useState } from "react";

export const UserContext = createContext();

const UserContextProvider = (props) => {
  const [user, setUser] = useState("");
  const [token, setToken] = useState("");

  return (
    <UserContext.Provider
      value={{
        userProvider: [user, setUser],
        tokenProvider: [token, setToken],
      }}
    >
      {props.children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;
