import { ApplicationStatusSchema } from "@/dummy-backend/types";

type Props = {
  selectedApplication: ApplicationStatusSchema | undefined;
};

export default function LiveView({ selectedApplication }: Props) {
  if (!selectedApplication) {
    return null;
  }

  return (
    <div className="flex h-full w-full flex-col gap-2">
      <div className="bg-muted aspect-video w-full rounded-md">video</div>
      <div className="flex w-full gap-2 p-2">
        <div className="flex w-full flex-col gap-2">
          <div className="font-bold">
            Title: {selectedApplication.job.title}
          </div>
          <div>Company: {selectedApplication.job.company_name}</div>
          <div>Start date: {selectedApplication.startDate}</div>
          <div>Completed date: {selectedApplication.completedDate ?? "-"}</div>
          <div>Status: {selectedApplication.status}</div>
          <div>Session ID: {selectedApplication.sessionId}</div>
        </div>
        <div>Hello world</div>
      </div>
    </div>
  );
}
