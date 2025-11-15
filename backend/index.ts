import express, { application, Request, Response } from 'express';
// import sessionRoutes from 'routes/session';
import applicationRoutes from './routes/apply';
import searchRoutes from './routes/search';


const app = express();

app.use('/apply', applicationRoutes);
app.use('/search' , searchRoutes);

app.listen(8000);