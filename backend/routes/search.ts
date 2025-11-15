import express, { Request, Response } from "express";
import { SearchJobSchema, JobSearchResponseSchema } from "../types.js";
import ensureStagehandSession from "../middleware/sessionMiddleware.js";
import performSearch from "../agent/index.js";

const router = express.Router();

router.post(
  "/",
  ensureStagehandSession,
  async (req: Request, res: Response) => {
    const parseResult = SearchJobSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({ errors: parseResult.error.flatten() });
    }

    try {
      const jobs = await performSearch();
      const responseValidation = JobSearchResponseSchema.parse({ results: jobs });
      return res.status(200).json(responseValidation);
    } catch (error) {
      console.error("Search route error", error);
      return res.status(500).json({ message: "Failed to perform search" });
    }
  }
);

export default router;
