import { JobSchema } from "@/backend/types";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useCallback } from "react";
import z from "zod";

type ApplyFormProps = {
  setData: (data: JobSchema[] | undefined) => void;
  formRef: React.RefObject<HTMLFormElement>;
};

export default function ApplyForm({ setData, formRef }: ApplyFormProps) {
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      {
        setData(undefined);
      }
      {
        const res = await fetch("http://localhost:3000/api/jobs", {
          method: "POST",
          body: new FormData(formRef.current),
        });

        if (!res.ok) {
          return;
        }

        const data = await res.json();
        const parsedData = z.array(JobSchema).safeParse(data);

        if (!parsedData.success) {
          return;
        }

        setData(parsedData.data);
      }
    },
    [],
  );

  return (
    <form className="flex w-full gap-2" onSubmit={handleSubmit} ref={formRef}>
      <Field>
        <FieldLabel htmlFor="search">Search</FieldLabel>
        <Input
          required
          placeholder="Job title, company name, or keyword"
          id="search"
          name="search"
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="location">Location</FieldLabel>
        <Input
          required
          placeholder="City, state, or country"
          id="location"
          name="location"
        />
      </Field>
      <Field className="flex-1">
        <FieldLabel htmlFor="type">Type</FieldLabel>
        <Select defaultValue="">
          <SelectTrigger id="type" name="type">
            <SelectValue placeholder="type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="internship">Internship</SelectItem>
            <SelectItem value="full-time">Full-time</SelectItem>
            <SelectItem value="part-time">Part-time</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
            <SelectItem value="freelance">Freelance</SelectItem>
            <SelectItem value="volunteer">Volunteer</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field className="flex-1">
        <FieldLabel htmlFor="start">Start date</FieldLabel>
        <Input
          required
          placeholder="YYYY-MM-DD"
          id="start"
          name="start"
          type="date"
        />
      </Field>
    </form>
  );
}
