import { Router } from 'express';
import { testRouter } from './test';
import { authRouter } from './auth';

export const routes = Router();

routes.use(authRouter);
routes.use('/monday', testRouter);

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
