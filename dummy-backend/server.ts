import { ApplicationStatusSchema, JobSchema } from "../backend/types";
import crypto from "crypto";

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
        const formdata = await req.json();
        console.log(formdata);
        const placeholder: JobSchema[] = Array(500)
          .fill(0)
          .map(() => ({
            id: crypto.randomUUID(),
            company: "Google",
            title: "Software Engineer",
            location: "San Francisco",
            description:
              "We are looking for a Software Engineer to join our team. The ideal candidate should have a strong background in software engineering and be comfortable working in a team.",
            source: "https://www.linkedin.com/jobs/view/3321370400/",
          }));
        return Response.json(placeholder, CORS_HEADERS);
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
