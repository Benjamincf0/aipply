"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApplicationStatusSchema } from "@/dummy-backend/types";
import { cn } from "@/lib/utils";
import LiveView from "./LiveView";
import { useState, use } from "react";
import { Context } from "../Context";

export default function JobsPage() {
  const { state } = use(Context);

  const [selectedApplication, setSelectedApplication] = useState<
    ApplicationStatusSchema | undefined
  >();

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
          {state.applications.map((app) => (
            <TableRow
              key={app.job.job_id}
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
                <div>{app.job.company_name}</div>
              </TableCell>
              {selectedApplication === undefined && (
                <>
                  <TableCell>{app.startDate ?? "-"}</TableCell>
                  <TableCell className="text-right">
                    {app.completedDate ?? "-"}
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <LiveView selectedApplicationId={selectedApplication?.job.job_id} />
    </div>
  );
}
