import express, { application, Request, Response } from 'express';
// import sessionRoutes from 'routes/session';
import applicationRoutes from './routes/apply.js';
import searchRoutes from './routes/search.js';


const app = express();

app.use('/apply', applicationRoutes);
app.use('/search' , searchRoutes);

app.listen(8000);