import z from "zod";
import { ApplicationStatusSchema } from "../backend/types";
import crypto from "crypto";
import { JobResultSchema, JobSearchReq } from "./types";

const CORS_HEADERS = {
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  },
};

const server = Bun.serve({
  port: 8080,
  hostname: "127.0.0.1",
  routes: {
    "/api/job/search": {
      POST: async (req) => {
        const data = await req.json();

        const parsed = JobSearchReq.safeParse(data);

        if (!parsed.success) {
          return Response.json(
            { error: parsed.error.issues[0]?.message },
            CORS_HEADERS,
          );
        }

        const apiKey = process.env.SERPAPI_API_KEY!;

        console.log(apiKey);

        const { search, location, type } = parsed.data;
        const params = new URLSearchParams({
          engine: "google_jobs",
          q: search + type ? ` ${type}` : "",
          hl: "en",
          api_key: process.env.SERPAPI_API_KEY!,
        });

        if (location) {
          params.append("location", location);
        }

        const url = `https://serpapi.com/search?${params.toString()}`;

        const res = await fetch(url);
        const json = (await res.json()) as any;

        const results = json.jobs_results;
        console.log("results:", results);

        const parsedResults = z.array(JobResultSchema).safeParse(results);
        console.log("parsedResults:", parsedResults);

        if (!parsedResults.success) {
          return Response.json(
            { error: parsedResults.error.issues[0]?.message },
            CORS_HEADERS,
          );
        }

        return Response.json(parsedResults.data, CORS_HEADERS);
      },
    },

    "/api/application/list": {
      GET: async () => {
        const placeholder: ApplicationStatusSchema[] = Array(10)
          .fill(0)
          .map(() => ({
            job: {
              id: crypto.randomUUID(),
              company: "Google",
              title: "Software Engineer",
              location: "San Francisco",
              description:
                "We are looking for a Software Engineer to join our team. The ideal candidate should have a strong background in software engineering and be comfortable working in a team.",
              source: "https://www.linkedin.com/jobs/view/3321370400/",
            },
            coverLetter: "coverLetter",
            resume: "resume",
            startDate: "startDate",
            endDate: "endDate",
            status: "pending",
            sessionId: "sessionId",
          }));
        return Response.json(placeholder, CORS_HEADERS);
      },
    },
  },
});

console.log(`Server started on port ${server.port}`);
