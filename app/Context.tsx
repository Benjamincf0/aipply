"use client";

import { ApplicationStatusSchema } from "@/dummy-backend/types";
import { ActionDispatch, createContext, useEffect, useReducer } from "react";

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
  applications: ApplicationStatusSchema[];
  websocket: WebSocket | undefined;
};

export type Action =
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
    }
  | {
      type: "updateProfile";
      profileId: number;
      profile: Profile;
    }
  | {
      type: "setApplications";
      applications: ApplicationStatusSchema[];
    }
  | {
      type: "setWebsocket";
      websocket: WebSocket;
    };

export const Context = createContext<{
  state: AppState;
  dispatch: ActionDispatch<[action: Action]>;
}>({
  state: {
    selectedProfileId: -1,
    profiles: [],
    applications: [],
    websocket: new WebSocket("ws://localhost:8080"),
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
      const id = (state.profiles.at(-1)?.id || 0) + 1;

      return {
        ...state,
        profiles: [...state.profiles, { ...action.profile, id }],
      };
    }
    case "updateProfile": {
      const updatedProfiles = state.profiles.map((p) =>
        p.id === action.profileId ? action.profile : p,
      );
      return {
        ...state,
        profiles: updatedProfiles,
      };
    }
    case "setApplications": {
      return {
        ...state,
        applications: action.applications,
      };
    }
    case "setWebsocket": {
      return {
        ...state,
        websocket: action.websocket,
      };
    }
  }
}

export function ContextProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    selectedProfileId: -1,
    profiles: [],
    applications: [],
    websocket: undefined,
  });
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080/api/ws");

    ws.addEventListener("open", () => console.log("WebSocket connected"));
    ws.addEventListener("message", (event) => {
      const data = JSON.parse(event.data) as Action;
      console.log("WebSocket message:", data);

      dispatch(data);
    });

    dispatch({
      type: "setWebsocket",
      websocket: ws,
    });
  }, []);

  return (
    <Context.Provider value={{ state, dispatch }}>{children}</Context.Provider>
  );
}
