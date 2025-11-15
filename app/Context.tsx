"use client";

import { ActionDispatch, createContext, useReducer } from "react";

export type Profile = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  resume: File;
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
      id: number;
    }
  | {
      type: "setProfiles";
      profiles: Profile[];
    }
  | {
      type: "addProfile";
      profile: Omit<Profile, "id">;
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
        selectedProfileId: action.id,
      };
    case "setProfiles":
      return {
        ...state,
        profiles: action.profiles,
      };
    case "addProfile": {
      const id = state.profiles.length + 1;

      return {
        ...state,
        profiles: [...state.profiles, { ...action.profile, id }],
      };
    }
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
