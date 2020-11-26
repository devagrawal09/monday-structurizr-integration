import { config } from 'dotenv';
config();

import * as express from 'express';
import * as bodyParser from 'body-parser';
import { routes } from './routes';

const app = express();
const port = process.env.PORT;
// parse various different custom JSON types as JSON
app.use(bodyParser.json())
const urlencodedParser = bodyParser.urlencoded({extended:false});
app.use(routes);
app.post('/token', urlencodedParser, function(req, res){
    console.log(req.body);
    res.render('token-received', {data:req.body, title: 'token-saved', message: 'Token saved successfully'});
  });
app.listen(port, () => console.log(`Quickstart app listening at http://localhost:${port}`))

module.exports = app;
