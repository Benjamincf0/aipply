import { Request, Response, NextFunction } from 'express';
import "dotenv/config";
import { Stagehand } from "@browserbasehq/stagehand";

export default async (req: Request, res: Response, next: NextFunction) => {
    if (!process.env.BROWSERBASE_SESSION_ID) {
        const stagehand = new Stagehand({
        env: "LOCAL",
        verbose: 2,
        model: "google/gemini-2.0-flash-exp",
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        });

        await stagehand.init();

        const sessionID = stagehand.browserbaseSessionId;
        process.env.BROWSERBASE_SESSION_ID = sessionID;

        console.log(`Created new Browserbase session: ${sessionID}`);
    }
    next();
}
