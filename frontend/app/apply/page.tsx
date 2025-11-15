"use client";

import { useState } from "react";
import ApplyForm from "./ApplyForm";
import Results from "./Results";
import { Job } from "@/backend/types";

export default function ApplyPage() {
  const [data, setData] = useState<Job[]>();

  return (
    <div className="w-full basis-full">
      <ApplyForm />
      <Results />
    </div>
  );
}
