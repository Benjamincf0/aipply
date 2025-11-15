"use client";

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
import { useDebounceCallback } from "usehooks-ts";
import z from "zod";

type ApplyFormProps = {
  setData: (data: JobSchema[] | undefined) => void;
  formRef: React.RefObject<HTMLFormElement>;
};

export default function ApplyForm({ setData, formRef }: ApplyFormProps) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await submit();
  };

  async function submit() {
    {
      setData(undefined);
    }
    {
      const formData = new FormData(formRef.current);
      const d = Object.fromEntries(formData.entries());
      const json = JSON.stringify(d);

      const res = await fetch("http://localhost:8080/api/job/search", {
        method: "POST",
        body: json,
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
  }

  const debounced = useDebounceCallback(submit, 500);

  return (
    <form
      className="flex w-full shrink-0 gap-2"
      onSubmit={handleSubmit}
      ref={formRef}
    >
      <Field onChange={debounced}>
        <FieldLabel htmlFor="search">Search</FieldLabel>
        <Input
          required
          placeholder="Job title, company name, or keyword"
          id="search"
          name="search"
        />
      </Field>
      <Field onChange={debounced}>
        <FieldLabel htmlFor="location">Location</FieldLabel>
        <Input
          required
          placeholder="City, state, or country"
          id="location"
          name="location"
          onChange={debounced}
        />
      </Field>
      <Field className="flex-1" onChange={debounced}>
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
      <Field className="flex-1" onChange={debounced}>
        <FieldLabel htmlFor="start">Start date</FieldLabel>
        <Input placeholder="YYYY-MM-DD" id="start" name="start" type="date" />
      </Field>
    </form>
  );
}
