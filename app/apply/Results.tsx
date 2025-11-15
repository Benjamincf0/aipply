import { JobSchema } from "@/backend/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import {
  Select,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";

type ResultsProps = {
  data: JobSchema[] | undefined;
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
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}

function JobCard({ job }: { job: JobSchema }) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>{job.title}</CardTitle>
        <CardDescription>{job.company}</CardDescription>
        <CardAction>
          <Button
            variant="ghost"
            onClick={() => console.log("Apply", job)}
            className="hover:cursor-pointer"
          >
            Apply
          </Button>
        </CardAction>
      </CardHeader>
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
