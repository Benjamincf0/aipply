import { JobSchema } from "@/backend/types";
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

type ResultsProps = {
  data: JobResultSchema[] | undefined;
  formRef: React.RefObject<HTMLFormElement>;
};

export default function Results({ data, formRef }: ResultsProps) {
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
      <Footer />
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
          <Button variant="link" asChild className="text-muted-foreground p-0">
            <Link
              href={job.share_link}
              target="_blank"
              rel="noopener noreferrer"
            >
              Share
            </Link>
          </Button>
        </CardAction>
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

function Footer() {
  return (
    <div className="flex w-full shrink-0 justify-end gap-2">
      <Select defaultValue="">
        <SelectTrigger id="profile" name="profile">
          <SelectValue placeholder="profile" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Profile</SelectLabel>
            <SelectItem value="profile-1">Profile 1</SelectItem>
            <SelectItem value="profile-2">Profile 2</SelectItem>
            <SelectItem value="profile-3">Profile 3</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Button>Apply All</Button>
    </div>
  );
}
