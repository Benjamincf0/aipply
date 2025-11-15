import { Request, Response } from 'express';

export const applyController = {
  // GET /apply?status=applying&page=1
  listCurrent: async (req: Request, res: Response) => {
    console.log('Listing applications with query:', req.query);
    const applications = [
      { id: 1, title: 'Software Engineer', company: 'Tech Corp', status: 'Processing' },
      { id: 2, title: 'Frontend Developer', company: 'Web Solutions', status: 'interviewing' },
      { id: 3, title: 'Backend Developer', company: 'Data Systems', status: 'offered' },
    ];
    res.json({ applications: applications});
  },

  // POST /apply
  create: async (req: Request, res: Response) => {
    // TODO: start processing applications using Browserbase session
    // return session ID to client for tracking in response
    const stagehand = global.stagehand;
    console.log('Creating new application with session ID:', stagehand.browserbaseSessionID);
    res.json({ message: `Application(s) added to the queue https://browserbase.com/sessions/${stagehand.browserbaseSessionID}`, sessionID: stagehand.browserbaseSessionID });
  },

  // DELETE /apply/:id
  delete: async (req: Request, res: Response) => {
    const id = req.params.id;
    console.log('Deleting application with id:', id);
    res.send(`Deleted application ${id} from the queue`);
    // delete a job application from the queue
  }
};