"use client";

import { useRef, useState } from "react";
import ApplyForm from "./ApplyForm";
import Results from "./Results";
import { JobResultSchema } from "@/dummy-backend/types";

export default function ApplyPage() {
  const [data, setData] = useState<JobResultSchema[] | undefined>([]);
  const formRef = useRef<HTMLFormElement>(null!);

  return (
    <div className="flex w-full flex-1 flex-col gap-2 overflow-hidden p-1">
      <ApplyForm setData={setData} formRef={formRef} />
      <Results data={data} formRef={formRef} />
    </div>
  );
}
