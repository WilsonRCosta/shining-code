import React, { createContext, useEffect, useMemo, useState } from "react";
import { getUserInfo, deleteUser, setUserInfo } from "../service/local-storage";
import { useNavigate } from "react-router-dom";

export const UserContext = createContext(null);

export default function UserContextProvider({ children }) {
  const stored = useMemo(getUserInfo, []);
  const [user, setUser] = useState(stored.user || "");
  const [token, setToken] = useState(stored.token || "");
  const history = useNavigate();

  useEffect(() => setUserInfo(user, token), [user, token]);

  const value = useMemo(
    () => ({
      userProvider: [user, setUser],
      tokenProvider: [token, setToken],
      isAdmin: user === "shinning-code-admin", // TODO add role verification
      clearContext: () => {
        setUser("");
        setToken("");
        deleteUser();
        history("/signin");
      },
    }),
    [user, token]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
