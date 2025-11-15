import "dotenv/config";
import { Stagehand } from "@browserbasehq/stagehand";

async function main() {
  const stagehand = new Stagehand({
    env: "LOCAL",
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    model: "google/gemini-2.0-flash-exp",
  });

  try {
    await stagehand.init();

    console.log(`Stagehand Session Started`);
    console.log(
      `Watch live: https://browserbase.com/sessions/${stagehand.browserbaseSessionId}`
    );

    const page = stagehand.context.pages()[0];
    await page.goto("https://www.goccc.ca/events/");

    console.log("Page loaded successfully");

    const actions = await stagehand.observe(
      "find the details button of the first event on the page"
    );
    console.log(`Observed actions:\n`, JSON.stringify(actions, null, 2));

    if (actions.length > 0) {
      await stagehand.act(actions[0]);
    } else {
      await stagehand.act("details button of the first event on the page");
    }

    const eventDetails = await stagehand.extract(
      "Extract the event name, date, time, location, and description from the page."
    );
    console.log(`Event details:\n`, JSON.stringify(eventDetails, null, 2));
  } catch (error) {
    console.error("Detailed error:", error);
    throw error;
  } finally {
    await stagehand.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
