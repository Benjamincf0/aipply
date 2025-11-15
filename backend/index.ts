import express, { application, Request, Response } from 'express';
// import sessionRoutes from 'routes/session';
import applicationRoutes from './routes/apply';


const app = express();

app.use('/apply', applicationRoutes);

app.listen(8000);