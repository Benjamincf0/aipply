import { z } from "zod";
import { Stagehand } from "@browserbasehq/stagehand";
import type { JobResultSchema } from "./types";
import OpenAi from "openai";
import { APPLICANT_PROFILE, DUMMY_APPLICANT_CONTEXT } from "./dummy-data";
import { BrowserSDK } from "./sdk";
import { chromium } from "playwright";

class Agent {
  stagehand: Stagehand;
  openai: OpenAi;
  sdk: BrowserSDK;

  constructor() {
    this.stagehand = new Stagehand({
      env: "LOCAL",
      apiKey: process.env.BROWSERBASE_API_KEY,
      projectId: process.env.BROWSERBASE_PROJECT_ID!,
      model: "openai/gpt-5-mini",
      localBrowserLaunchOptions: {
        // executablePath: "/Applications/Chromium.app/Contents/MacOS/Chromium",
      },
      // Your OPENAI_API_KEY is automatically read from your .env
      // For how to configure different models, visit https://docs.stagehand.dev/configuration/models#first-class-models
    });

    this.openai = new OpenAi({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async init() {
    await this.stagehand.init();

    const session = await sdk.createSession();
  }

  async dispose() {
    await this.stagehand.close();
  }

  async apply(job: JobResultSchema) {
    const links = job.apply_options.map((option) => option.link);
    for (const link of links) {
      const success = await this.tryApply(link);
      console.log("success:", success);
      if (success) {
        return;
      }
    }
  }

  async tryApply(link: string): Promise<boolean> {
    const agent = this.stagehand.agent({
      systemPrompt: `You are an AI assistant helping to fill out job application forms. 

        IMPORTANT: Use the applicant information provided below to fill form fields. Match the field label/question to the appropriate data.

        ${DUMMY_APPLICANT_CONTEXT}

        RULES:
        1. Always use actual values from the applicant information above - NEVER use placeholder text like "string"
        2. Match form field labels to the appropriate applicant data (e.g., "First Name" → "${APPLICANT_PROFILE.firstName}")
        3. For dropdown/select fields, choose the option that best matches the applicant's data
        4. For yes/no questions, use your best judgment based on the applicant's profile
        5. Stop when the application requires to upload a resume
        6. Stop when the application requires to verify the applicant's email
        6. Fill each field with real, specific information from the applicant profile

        Work methodically and accurately.`,
    });

    const page = this.stagehand.context.pages()[0];
    if (!page) {
      return false;
    }

    await page.goto(link);

    let res = await agent.execute("apply to the job listed on the page.");

    const checkVerificationEmail = await this.stagehand.extract(
      "Detect if a verification code is sent to the applicant's email",
      z.boolean(),
    );
    console.log("checkVerificationEmail:", checkVerificationEmail);

    if (checkVerificationEmail) {
      return false;
      await this.stagehand.context.newPage();
      const secondPage = this.stagehand.context.pages()[1];
      if (!secondPage) {
        return false;
      }
      await secondPage.goto("https://mail.google.com");
      const verificationEmail = await this.stagehand.observe(
        "find the email verification email",
      );
      if (verificationEmail.length > 0) {
        for (const email of verificationEmail) {
          if (email.method !== "click") {
            continue;
          }
          await this.stagehand.act(email);
          const code = await this.stagehand.extract(
            "find the verification code",
            z.string(),
          );

          console.log(code);
        }
      }
    }

    const checkResumeUpload = await this.stagehand.extract(
      "Detect if the applicant has uploaded a resume",
      z.boolean(),
    );

    if (checkResumeUpload) {
      const resumePath =
        "/Users/vincentliu/Downloads/Minimalist White and Grey Professional Resume.pdf";

      const fileInput = page.locator("input[type=file]");
      await fileInput.setInputFiles(resumePath);
    }

    res = await agent.execute(
      "the user has now uploaded their resume, complete the application process. DO NOT upload another resume",
    );

    return res.success;
  }
}

async function main() {
  // const agent = new Agent();
  // await agent.init();

  // const url =
  //   "https://jobs.nokia.com/en/sites/CX_1/job/24330?utm_campaign=google_jobs_apply&utm_source=google_jobs_apply&utm_medium=organic";
  const url =
    "https://remote-zone.totalh.net/job/education-public-programs-and-engagement-internship/?utm_campaign=google_jobs_apply&utm_source=google_jobs_apply&utm_medium=organic";

  // await agent.tryApply(url);
  // await agent.dispose();
}

main();
