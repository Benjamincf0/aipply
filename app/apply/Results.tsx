import { JobSchema } from "@/backend/types";
import { Button } from "@/components/ui/button";

type ResultsProps = {
  data: JobSchema[] | undefined;
  formRef: React.RefObject<HTMLFormElement>;
};

export default function Results({ data, formRef }: ResultsProps) {
  if (!data)
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

  return <div className="">Results</div>;
}
