const STORAGE_KEY = "kairos-app-state";

const defaultState = {
  currentUser: null,
  accounts: {},
  sessions: {},
};

export function getAppState() {
  if (typeof window === "undefined") {
    return defaultState;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return defaultState;
    }

    const parsed = JSON.parse(raw);

    return {
      ...defaultState,
      ...parsed,
      accounts: parsed.accounts ?? {},
      sessions: parsed.sessions ?? {},
    };
  } catch {
    return defaultState;
  }
}

export function saveAppState(state) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function createBackup() {
  if (typeof window === "undefined") {
    return null;
  }

  const state = getAppState();
  return {
    ...state,
    backupDate: new Date().toISOString(),
    version: "1.0",
  };
}

export function restoreFromBackup(backupData) {
  if (typeof window === "undefined") {
    return;
  }

  const { backupDate, version, ...state } = backupData;
  saveAppState({
    ...defaultState,
    ...state,
    accounts: state.accounts ?? {},
    sessions: state.sessions ?? {},
  });
}
