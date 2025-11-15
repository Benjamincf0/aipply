import { Request, Response, NextFunction } from 'express';
import "dotenv/config";
import { Stagehand } from "@browserbasehq/stagehand";


export default async (req: Request, res: Response, next: NextFunction) => {
    if (!global.stagehand) {
        const stagehand = new Stagehand({
        env: "BROWSERBASE",
        verbose: 2,
        model: "google/gemini-2.0-flash-exp",
        apiKey: process.env.BROWSERBASE_API_KEY,
        projectId: process.env.BROWSERBASE_PROJECT_ID,
        });

        await stagehand.init();

        const sessionID = stagehand.browserbaseSessionId;
        global.stagehand = stagehand;

        console.log(`Created new Browserbase session: ${sessionID}`);
    }
    next();
}
