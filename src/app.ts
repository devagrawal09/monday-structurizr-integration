import { config } from 'dotenv';
config();

import * as path from 'path';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { routes } from './routes';

const app = express();
const port = process.env.PORT;
// parse various different custom JSON types as JSON

app.set('view engine', 'ejs');

app.use(bodyParser.json());

app.use('/static', express.static(path.join(__dirname, '..', 'static')));

app.use(routes);

app.listen(port, () => console.log(`Quickstart app listening at http://localhost:${port}`))

module.exports = app;
