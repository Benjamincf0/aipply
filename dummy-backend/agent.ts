import { z } from "zod";
import { Stagehand, AISdkClient } from "@browserbasehq/stagehand";
import type { JobResultSchema } from "./types";
import { APPLICANT_PROFILE, DUMMY_APPLICANT_CONTEXT } from "./dummy-data";
import { createHuggingFace } from "@ai-sdk/huggingface";

class Agent {
  stagehand: Stagehand;

  constructor() {
    const huggingFaceProvider = createHuggingFace({
      apiKey: process.env.HUGGINGFACE_API_KEY,
    });

    const huggingFaceClient = new AISdkClient({
      model: huggingFaceProvider("moonshotai/Kimi-K2-Thinking"),
    });

    this.stagehand = new Stagehand({
      env: "LOCAL",
      apiKey: process.env.BROWSERBASE_API_KEY,
      projectId: process.env.BROWSERBASE_PROJECT_ID!,
      // model: "google/gemini-2.5-computer-use-preview-10-2025",
      // model: "openai/computer-use-preview",
      model: "openai/gpt-5-mini",
      // model: "google/gemini-2.5-flash",
      // llmClient: huggingFaceClient,
      localBrowserLaunchOptions: {
        executablePath: "/Applications/Chromium.app/Contents/MacOS/Chromium",
      },
    });
  }

  async init() {
    await this.stagehand.init();
  }

  async dispose() {
    await this.stagehand.close();
  }

  getAgent(cua?: boolean) {
    const agent = this.stagehand.agent({
      systemPrompt: `You are an AI assistant helping to fill out job application forms. 

        IMPORTANT: Use the applicant information provided below to fill form fields. Match the field label/question to the appropriate data.

        ${DUMMY_APPLICANT_CONTEXT}

        RULES:
        1. Always use actual values from the applicant information above - NEVER use placeholder text like "string"
        2. Match form field labels to the appropriate applicant data (e.g., "First Name" → "${APPLICANT_PROFILE.firstName}")
        3. For dropdown/select fields, choose the option that best matches the applicant's data
        4. For yes/no questions, use your best judgment based on the applicant's profile
        5. Stop when the application requires to verify the applicant's email
        6. Fill each field with real, specific information from the applicant profile

        Work methodically and accurately.`,
      cua,
      model: cua ? "openai/computer-use-preview" : "openai/gpt-5-mini",
    });

    return agent;
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
    const agent = this.getAgent(false);

    const page = this.stagehand.context.pages()[0];
    if (!page) {
      return false;
    }

    await page.goto(link);

    let inApplicationForm = false;
    while (!inApplicationForm) {
      const actionResult = await this.stagehand.act(
        "click the button that applies to the job",
      );

      if (!actionResult.success) {
        await agent.execute("click the button that applies to the job");
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      inApplicationForm = await this.stagehand.extract(
        "Detect if the applicant is in the application form of the job",
        z.boolean(),
      );
    }

    let finishApplication = false;
    while (!finishApplication) {
      let hasFilledForm = false;

      while (!hasFilledForm) {
        const fields = await this.stagehand.observe(
          "find all empty fields of the application form on the page except file upload fields",
        );

        for (const field of fields) {
          await this.stagehand.act(field);
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));

        hasFilledForm = await this.stagehand.extract(
          "Detect if the applicant has filled all the fields of the application form on the page",
          z.boolean(),
        );
      }

      const nextButtons = await this.stagehand.observe(
        "find the button that navigates to the next page of the application form",
      );

      if (nextButtons.length > 0) {
        await this.stagehand.act(nextButtons[0]!);
        continue;
      }

      const submitButton = await this.stagehand.observe(
        "find the button that submits the application form",
      );
      if (submitButton.length > 0) {
        await this.stagehand.act(submitButton[0]!);
      }

      finishApplication = await this.stagehand.extract(
        "Detect if the applicant has finished the application process",
        z.boolean(),
      );

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const checkVerificationEmail = await this.stagehand.extract(
      "Detect if a verification code is sent to the applicant's email",
      z.boolean(),
    );

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

    // const checkResumeUpload = await this.stagehand.extract(
    //   "Detect if the applicant has uploaded a resume",
    //   z.boolean(),
    // );
    //
    // if (checkResumeUpload) {
    //   const resumePath =
    //     "/Users/vincentliu/Downloads/Minimalist White and Grey Professional Resume.pdf";
    //
    //   const fileInput = page.locator("input[type=file]");
    //   await fileInput.setInputFiles(resumePath);
    // }
    //
    // res = await agent.execute(
    //   "the user has now uploaded their resume, complete the application process. DO NOT upload another resume",
    // );

    return true;
  }
}

async function main() {
  const agent = new Agent();
  await agent.init();

  // const url =
  //   "https://jobs.nokia.com/en/sites/CX_1/job/24330?utm_campaign=google_jobs_apply&utm_source=google_jobs_apply&utm_medium=organic";
  const url =
    "https://jobs.lever.co/wealthsimple/9ff3e932-cdc7-4161-b4aa-29b4f58866ec?utm_campaign=google_jobs_apply&utm_source=google_jobs_apply&utm_medium=organic";

  await agent.tryApply(url);
  await agent.dispose();
}

main();
