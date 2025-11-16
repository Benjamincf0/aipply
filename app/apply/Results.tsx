import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import { JobResultSchema } from "@/dummy-backend/types";
import Link from "next/link";
import { use } from "react";
import { Context } from "../Context";

type ResultsProps = {
  data: JobResultSchema[] | undefined;
  formRef: React.RefObject<HTMLFormElement>;
  setData: (data: JobResultSchema[] | undefined) => void;
};

export default function Results({ data, formRef, setData }: ResultsProps) {
  if (!data)
    return (
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-2">
        Loading...
      </div>
    );

  if (data.length === 0)
    return (
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-2">
        <p>Start by searching for a job</p>
        <Button
          className="hover:cursor-pointer"
          variant="outline"
          onClick={() => formRef.current.requestSubmit()}
        >
          Search
        </Button>
      </div>
    );

  return (
    <>
      <div className="flex w-full flex-1 overflow-x-hidden overflow-y-auto p-1">
        <div
          className="grid w-full grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-2"
          style={{ gridAutoRows: "min-content" }}
        >
          {data.map((job) => (
            <JobCard key={job.job_id} job={job} />
          ))}
        </div>
      </div>
      <Footer formRef={formRef} data={data} setData={setData} />
    </>
  );
}

function JobCard({ job }: { job: JobResultSchema }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{job.title}</CardTitle>
        <CardDescription>
          <p>{job.company_name}</p>
        </CardDescription>
        <CardAction>
          <Button
            variant="ghost"
            onClick={() => console.log("Apply", job)}
            className="hover:cursor-pointer"
          >
            Apply
          </Button>
        </CardAction>
        <Button
          variant="link"
          asChild
          className="text-muted-foreground w-fit p-0"
        >
          <Link href={job.share_link} target="_blank" rel="noopener noreferrer">
            Share
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <p>Apply links:</p>
        <div className="flex flex-wrap gap-x-1 gap-y-1 overflow-hidden">
          {job.apply_options.map((option) => (
            <Button
              className="bg-secondary max-w-full"
              key={option.title}
              variant="link"
              size="sm"
              asChild
            >
              <Link
                href={option.link}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate"
              >
                {option.title}
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function Footer({
  formRef,
  data,
  setData,
}: {
  formRef: React.RefObject<HTMLFormElement>;
  data: JobResultSchema[];
  setData: (data: JobResultSchema[] | undefined) => void;
}) {
  const { state, dispatch } = use(Context);

  return (
    <div className="flex w-full shrink-0 justify-between gap-2">
      <Button
        variant="secondary"
        onClick={() => formRef.current.requestSubmit()}
      >
        Search
      </Button>
      <div className="flex gap-2">
        <Select
          defaultValue=""
          onValueChange={(value) => {
            console.log("value:", value);

            dispatch({
              type: "setSelectedProfileId",
              id: +value,
            });
          }}
        >
          <SelectTrigger id="profile" name="profile">
            <SelectValue placeholder="profile" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Profile</SelectLabel>
              {state.profiles.map((p) => (
                <SelectItem value={"" + p.id} key={p.id}>
                  Profile {p.id}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button
          onClick={async () => {
            const ws = state.websocket;

            if (!ws) {
              return;
            }

            ws.send(
              JSON.stringify({
                type: "application/add",
                data: {
                  profileId: state.selectedProfileId,
                  jobs: data,
                },
              }),
            );
            setData([]);
          }}
        >
          Apply All
        </Button>
      </div>
    </div>
  );
}
