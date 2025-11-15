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
    <Table className="w-full flex-1 p-1">
      <TableHeader>
        <TableRow className="w-full">
          <TableHead>Status</TableHead>
          <TableHead>Job</TableHead>
          <TableHead>Start</TableHead>
          <TableHead className="text-right">Completed</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((app) => (
          <TableRow key={app.job.id} className="w-full">
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
            <TableCell>{app.startDate}</TableCell>
            <TableCell className="text-right">
              {app.completedDate ?? "-"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
