import express, { Express } from 'express';
import dotenv from 'dotenv';
import routes from './routes/api';

dotenv.config();

const app: Express = express();
app.use(express.json());

app.use('/api', routes);

const port = process.env.PORT ?? 3000;

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});