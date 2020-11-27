import { Router } from 'express';
import * as qs from 'querystring';
import * as jwt from 'jsonwebtoken';
import { findIntegration, createIntegration } from '../database/integration';

const Monday = require('monday-sdk-js');

export const authRouter = Router();

const monday = Monday();

authRouter.get('/auth', async (req, res) => {
  const { token } = req.query;
  const { userId, backToUrl } = jwt.verify(token as string, process.env.MONDAY_SIGNING_SECRET!) as any;

  const integration = await findIntegration(userId);

  if(integration) {
    return res.redirect(backToUrl);
  }

  return res.redirect(`https://auth.monday.com/oauth2/authorize?${
    qs.stringify({
      client_id: process.env.MONDAY_CLIENT_ID,
      state: token
    })
  }`);
});

authRouter.get('/oauth/callback', async (req, res) => {
  const { code, state: token } = req.query;

  const { access_token } = await monday.oauthToken(code, process.env.MONDAY_CLIENT_ID, process.env.MONDAY_CLIENT_SECRET)

  return res.redirect(`/auth/form?${
    qs.stringify({ token, mondayToken: access_token })
  }`);
});

authRouter.get('/auth/form', (req, res) => {
  const { token, mondayToken } = req.query;
  res.render('form', { token, mondayToken });
});

authRouter.get('/auth/structurizr', async (req, res) => {
  const {
    token,
    mondayToken,
    structurizrId,
    structurizrKey,
    structurizrSecret
  }: any = req.query;

  const { userId, backToUrl } = jwt.verify(token as string, process.env.MONDAY_SIGNING_SECRET!) as any;

  await createIntegration({
    userId,
    mondayToken,
    structurizrId,
    structurizrKey,
    structurizrSecret
  });

  return res.redirect(backToUrl);
});
