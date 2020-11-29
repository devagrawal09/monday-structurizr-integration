import { config } from 'dotenv';
config();

import * as path from 'path';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import debug from 'debug';
import { routes } from './routes';

const logger = debug(`app`);

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use('/static', express.static(path.join(__dirname, '..', 'static')));

app.use(routes);

app.listen(port, () => logger(`App running on port ${port}`))

export default app;
