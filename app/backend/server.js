import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import { routes } from './routes';
import { Cookies } from 'Http/cookies';

dotenv.config();

const app = express();
const port = 8001;

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/authorized', Cookies.authorizedOnly(), (req, res) =>
  res.send('I am authorized')
);
app.use('/api/', routes.express);

app.listen(port, '0.0.0.0', () => {
  console.log(`Listening at 0.0.0.0:${port}`);
});
