import express, { Request, Response } from 'express';
import { applyController } from '../controllers/applyController';
import { z } from 'zod';
const router = express.Router();

const SearchJobSchema = z.object({
  query: z.string().min(1),
  location: z.string().optional(),
  type: z.enum(['full-time', 'part-time', 'contract']).optional(),
});

router.route('/').post((req: Request, res: Response) => {
    const data = req.body;
  
  res.send('Search endpoint is under construction');
});
export default router;