import "dotenv/config";
import { Stagehand } from "@browserbasehq/stagehand";

export default async function main() {
    const stagehand = new Stagehand({
    env: "LOCAL",
    verbose: 2,
    model: "google/gemini-2.0-flash-exp",
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });

    await stagehand.init();

    console.log(`Stagehand Session Started`);

    // Worker creates session, gets debug URL
    // Extract Browserbase session ID
    const debugUrl = `https://browserbase.com/sessions/${stagehand.browserbaseSessionId}`;

    console.log(
        `Watch live: ${debugUrl}`
    );
    // Emit to frontend via Socket.io
    

    await new Promise((resolve) => setTimeout(resolve, 60000)); // Keep session alive for 60 seconds

    await stagehand.close();
}