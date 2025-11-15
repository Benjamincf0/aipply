import express, { Request, Response } from 'express';
import { applyController } from '../controllers/applyController';
const router = express.Router();

router.get('/', applyController.list);   // List sites (passwords masked)
router.post('/', applyController.create); // { site, username, password }
router.delete('/:id', applyController.delete);

export default router;