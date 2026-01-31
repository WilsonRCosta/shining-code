import React, { createContext, useEffect, useMemo, useState } from "react";
import { deleteUser, getUserInfo, setUserInfo } from "../service/local-storage";
import { useNavigate } from "react-router-dom";

export const UserContext = createContext(null);

export default function UserContextProvider({ children }) {
  const [user, setUser] = useState(() => getUserInfo().user || "");
  const [token, setToken] = useState(() => getUserInfo().token || "");
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
