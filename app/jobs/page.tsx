"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import z from "zod";
import { ApplicationStatusSchema } from "@/backend/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import LiveView from "./LiveView";
import { useState } from "react";

export default function JobsPage() {
  const { data, isPending } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const res = await fetch("http://localhost:8080/api/application/list");
      if (!res.ok) {
        return [];
      }

      const data = await res.json();

      const parsedData = z.array(ApplicationStatusSchema).safeParse(data);

      if (!parsedData.success) {
        return [];
      }

      return parsedData.data;
    },
  });

  const [selectedApplication, setSelectedApplication] = useState<
    ApplicationStatusSchema | undefined
  >();

  if (isPending || !data) {
    return (
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-2">
        Loading...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex w-full flex-1 items-center justify-center gap-2">
        Navigate to the{" "}
        <Button asChild variant="link" className="p-0">
          <Link href="/apply">Apply</Link>
        </Button>
        page to search for jobs.
      </div>
    );
  }

  return (
    <div className="flex w-full flex-1 gap-4">
      <Table className="w-full p-1">
        <TableHeader>
          <TableRow className="w-full">
            <TableHead>Status</TableHead>
            <TableHead>Job</TableHead>
            {selectedApplication === undefined && (
              <>
                <TableHead>Start</TableHead>
                <TableHead className="text-right">Completed</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((app) => (
            <TableRow
              key={app.job.id}
              onClick={() => setSelectedApplication(app)}
              className={cn(
                "w-full cursor-pointer",
                selectedApplication === app && "bg-muted hover:bg-muted",
              )}
            >
              <TableCell>
                <div className="flex w-fit items-center justify-center gap-2">
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full",
                      app.status === "running" && "bg-yellow-500",
                      app.status === "pending" && "bg-gray-500",
                      app.status === "completed" && "bg-green-500",
                      app.status === "failed" && "bg-red-500",
                    )}
                  />
                  {app.status}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-bold">{app.job.title}</div>
                <div>{app.job.company}</div>
              </TableCell>
              {selectedApplication === undefined && (
                <>
                  <TableCell>{app.startDate}</TableCell>
                  <TableCell className="text-right">
                    {app.completedDate ?? "-"}
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <LiveView selectedApplication={selectedApplication} />
    </div>
  );
}
