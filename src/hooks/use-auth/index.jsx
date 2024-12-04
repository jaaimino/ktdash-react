import React from "react";
import { request } from "../use-api";
import { useLocalStorage } from "@mantine/hooks";

export default function useAuth_deprecated() {
  const [user, setUser] = useLocalStorage({ key: "auth" });

  const setupSession = React.useCallback(async () => {
    const auth = await request("/session.php", {
      method: "GET",
    });
    if (auth?.userid) {
      setUser(auth);
    }
  }, [setUser]);

  const signup = React.useCallback(
    async (username, password, confirmpassword) => {
      const auth = await request("/user.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        body: new URLSearchParams({
          username,
          password,
          confirmpassword,
        }).toString(),
      });
      if (auth?.userid) {
        setUser(auth);
        return auth;
      } else {
        return auth;
      }
    },
    [setUser]
  );

  const login = React.useCallback(
    async (username, password) => {
      const auth = await request("/session.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        body: new URLSearchParams({
          username,
          password,
        }).toString(),
      });
      if (auth?.userid) {
        setUser(auth);
        return auth;
      } else {
        return auth;
      }
    },
    [setUser]
  );

  const logout = React.useCallback(async () => {
    const auth = await request("/session.php", {
      method: "DELETE",
    });
    setUser(undefined);
    return auth;
  }, [setUser]);

  return { user, login, logout, signup, setupSession };
}
