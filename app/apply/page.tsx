"use client";

import { useRef, useState } from "react";
import ApplyForm from "./ApplyForm";
import Results from "./Results";
import { JobSchema } from "@/backend/types";

export default function ApplyPage() {
  const [data, setData] = useState<JobSchema[] | undefined>([]);
  const formRef = useRef<HTMLFormElement>(null!);

  return (
    <div className="flex w-full basis-full flex-col gap-2 overflow-hidden">
      <ApplyForm setData={setData} formRef={formRef} />
      <Results data={data} formRef={formRef} />
    </div>
  );
}
