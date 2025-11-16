"use client";

import { use, useEffect, useState } from "react";
import { Context, Profile } from "../Context";
import NewProfile from "./NewProfile";
import ProfileList from "./ProfileList";
import PdfViewer from "./PdfViewer";

export default function ProfilesPage() {
  const { state } = use(Context);
  const [pdfUrl, setPdfUrl] = useState<string>("");

  useEffect(() => {
    console.log("Profiles updated:", state.profiles);
  }, [state.profiles]);

  return (
    <div className="flex h-full w-full justify-between gap-4 overflow-x-hidden overflow-y-auto p-4">
      <div className="flex w-full flex-1 flex-col items-start">
        {state.profiles.length !== 0 && (
          <>
            <ProfileList />
          </>
        )}
        <NewProfile />
      </div>
      <PdfViewer />
    </div>
  );
}
