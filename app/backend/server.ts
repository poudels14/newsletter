import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import noCache from 'nocache';
import { routes } from './routes';

dotenv.config();

const app = express();
const port = 8001;

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(helmet());
app.use(noCache());
app.use(cors({ origin: [] }));

app.disable('etag');

app.use('/api/', routes.express);

app.listen(port, '0.0.0.0', () => {
  console.log(`Listening at 0.0.0.0:${port}`);
});
