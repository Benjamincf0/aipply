import express, { Request, Response } from 'express';
import { applyController } from '../controllers/applyController.js';
import getSession from '../middleware/sessionMiddleware.js';
const router = express.Router();

router.route('/').post(applyController.listCurrent)  // List currently processing applications
    .get(getSession, applyController.create) // Add 1 or more new application to the queue
    .delete(applyController.delete); // Delete an application from the queue using its ID as a query param

export default router;