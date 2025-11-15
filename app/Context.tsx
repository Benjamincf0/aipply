"use client";

import { ActionDispatch, createContext, useReducer } from "react";

export type Profile = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  resumeUrl: string;
  country?: string;
  city?: string;
  state?: string;
  address?: string;
  zip?: string;
  about?: string;
};

export type AppState = {
  selectedProfileId: number;
  profiles: Profile[];
};

type Action =
  | {
      type: "setSelectedProfileId";
      payload: number;
    }
  | {
      type: "setProfiles";
      payload: Profile[];
    };

export const Context = createContext<{
  state: AppState;
  dispatch: ActionDispatch<[action: Action]>;
}>({
  state: {
    selectedProfileId: -1,
    profiles: [],
  },
  dispatch: () => {},
});

function reducer(state: AppState, action: Action) {
  switch (action.type) {
    case "setSelectedProfileId":
      return {
        ...state,
        selectedProfileId: action.payload,
      };
    case "setProfiles":
      return {
        ...state,
        profiles: action.payload,
      };
    default:
      throw new Error("Unknown action type");
  }
}

export function ContextProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    selectedProfileId: -1,
    profiles: [],
  });

  return (
    <Context.Provider value={{ state, dispatch }}>{children}</Context.Provider>
  );
}
