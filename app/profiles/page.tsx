"use client";

import { use } from "react";
import { Context } from "../Context";
import NewProfile from "./NewProfile";

export default function ProfilesPage() {
  const { state } = use(Context);

  if (state.profiles.length === 0) {
    return <NewProfile />;
  }

  return <div>Profiles</div>;
}
