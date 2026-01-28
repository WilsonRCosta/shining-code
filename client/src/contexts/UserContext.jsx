import React, { createContext, useEffect, useMemo, useState } from "react";
import { getUserInfo, deleteUser, setUserInfo } from "../service/serviceLocalStorage";

export const UserContext = createContext(null);

export default function UserContextProvider({ children }) {
  const stored = useMemo(getUserInfo, []);
  const [user, setUser] = useState(stored.user || "");
  const [token, setToken] = useState(stored.token || "");

  useEffect(() => setUserInfo(user, token), [user, token]);

  const value = useMemo(
    () => ({
      userProvider: [user, setUser],
      tokenProvider: [token, setToken],
      isAdmin: user === "shinning-code-admin", // TODO add role verification
      logout: () => {
        setUser("");
        setToken("");
        deleteUser();
      },
    }),
    [user, token]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
