import { Request, Response } from 'express';

export const applyController = {
  // GET /api/apply?status=applying&page=1
  list: async (req: Request, res: Response) => {
    console.log('Listing applications with query:', req.query);
    res.send('List of applications');
    // get the job applications currently being processed on browserbase
  },

  // POST /api/apply { title, company, url, resumeId? }
  create: async (req: Request, res: Response) => {
    console.log('Creating application with body:', req.body);
    res.send('List of applications');
    // add a new job application to the queue
  },

  // POST /api/apply/batch [{ title, company, url }, ...]
  batchCreate: async (req: Request, res: Response) => {
    console.log('Creating batch applications with body:', req.body);
    res.send('List of applications');
    // add multiple job applications to the queue
  },

  // DELETE /api/apply/:id
  delete: async (req: Request, res: Response) => {
    console.log('Deleting application with id:', req.params.id);
    res.send('List of applications');
    // delete a job application from the queue
  }
};