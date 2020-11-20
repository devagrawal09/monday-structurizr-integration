import { Router } from 'express';
import { testRouter } from './test';

export const routes = Router();

routes.use(testRouter);

routes.get('/', function(req, res) {
  res.json(getHealth());
});

routes.get('/health', function(req, res) {
  res.json(getHealth());
  res.end();
});

function getHealth() {
  return {
    ok: true,
    message: 'Healthy'
  };
}
