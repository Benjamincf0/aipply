import express, { Request, Response } from 'express';
import { applyController } from '../controllers/applyController';
import getSessionID from '../middleware/sessionMiddleware';
const router = express.Router();

router.route('/').get(applyController.listCurrent)  // List currently processing applications
    .post(getSessionID, applyController.create) // Add 1 or more new application to the queue
    .delete(applyController.delete); // Delete an application from the queue using its ID as a query param

export default router;