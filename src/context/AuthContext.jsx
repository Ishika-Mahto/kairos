import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getAppState, saveAppState } from "../utils/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [appState, setAppState] = useState(() => getAppState());

  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  const value = useMemo(
    () => ({
      appState,
      user: appState.currentUser,
      login(email, password) {
        const normalizedEmail = email.trim().toLowerCase();
        const account = appState.accounts[normalizedEmail];

        if (!account || account.password !== password) {
          return { ok: false, message: "Invalid email or password." };
        }

        setAppState((current) => ({
          ...current,
          currentUser: {
            name: account.name,
            email: normalizedEmail,
          },
        }));

        return { ok: true };
      },
      signup({ name, email, password }) {
        const normalizedEmail = email.trim().toLowerCase();

        if (appState.accounts[normalizedEmail]) {
          return { ok: false, message: "An account with this email already exists." };
        }

        setAppState((current) => ({
          ...current,
          accounts: {
            ...current.accounts,
            [normalizedEmail]: {
              name: name.trim(),
              password,
            },
          },
          currentUser: {
            name: name.trim(),
            email: normalizedEmail,
          },
          sessions: {
            ...current.sessions,
            [normalizedEmail]: current.sessions[normalizedEmail] ?? {
              dashboard: null,
              tasks: [],
            },
          },
        }));

        return { ok: true };
      },
      logout() {
        setAppState((current) => ({
          ...current,
          currentUser: null,
        }));
      },
      updateSession(updater) {
        setAppState((current) => {
          if (!current.currentUser?.email) {
            return current;
          }

          const email = current.currentUser.email;
          const currentSession = current.sessions[email] ?? {
            dashboard: null,
            tasks: [],
          };

          return {
            ...current,
            sessions: {
              ...current.sessions,
              [email]: updater(currentSession),
            },
          };
        });
      },
      session:
        appState.currentUser?.email
          ? appState.sessions[appState.currentUser.email] ?? {
              dashboard: null,
              tasks: [],
            }
          : null,
    }),
    [appState],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
