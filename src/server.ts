import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
import './api/database/database';
import router from './api/v1/routes';
import { generateDomainFile } from './api/v1/utils/wordnetHelper';
let corsOptions = {
  origin: '*/*',
};
app.get('/', (req: Request, res: Response) => {
  res.send('Backend with TypeScript is running!');
});
// app.use('/api/v1', routes);
app.use('/api/v1', router);

app.listen(PORT, (error?: Error) => {
  if (error) {
    console.error("Error occurred, server can't start", error);
  } else {
    console.log(
      `Server is successfully running, and app is listening on port ${PORT}`
    );
  }
});
