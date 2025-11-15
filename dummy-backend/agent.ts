import { z } from "zod";
import { Stagehand } from "@browserbasehq/stagehand";

async function main() {
  const stagehand = new Stagehand({
    env: "LOCAL",
    apiKey: process.env.BROWSERBASE_API_KEY,
    projectId: process.env.BROWSERBASE_PROJECT_ID!,
    model: "openai/gpt-4o",
    localBrowserLaunchOptions: {
      executablePath: "/Applications/Chromium.app/Contents/MacOS/Chromium",
    },
    // Your OPENAI_API_KEY is automatically read from your .env
    // For how to configure different models, visit https://docs.stagehand.dev/configuration/models#first-class-models
  });

  await stagehand.init();
  const page = stagehand.context.pages()[0];

  if (!page) {
    return;
  }

  await page.goto("https://ca.indeed.com/?r=us");

  console.info("Connected!");

  // For demo purposes, we'll wait a second so we can watch.
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Visit TODO MVC
  await page.goto("https://ca.indeed.com/?r=us");

  await stagehand.act("Click on the job search bar");
  await stagehand.act('Type in the job search bar "software engineering"');
  await stagehand.act('Click on the "find jobs" button');

  // Wait for 2 seconds
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const res = await stagehand.extract(
    "extract the name of the first job",
    z.string(),
  );

  console.log({ res });
  console.info("Success!");

  await stagehand.close();
}

main();
