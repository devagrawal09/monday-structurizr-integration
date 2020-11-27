import { Router } from 'express';
import * as qs from 'querystring';
import * as jwt from 'jsonwebtoken';
import { getToken, setToken } from '../database/integration';

const Monday = require('monday-sdk-js');

export const authRouter = Router();

const monday = Monday();

authRouter.get('/auth', async (req, res) => {
  const { token } = req.query;
  const { userId, backToUrl } = jwt.verify(token as string, process.env.MONDAY_SIGNING_SECRET!) as any;

  const integration = await getToken(userId);

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
  const { code, state } = req.query;
  const { userId, backToUrl } = jwt.verify(state as string, process.env.MONDAY_SIGNING_SECRET!) as any;

  // Get access token
  const token = await monday.oauthToken(code, process.env.MONDAY_CLIENT_ID, process.env.MONDAY_CLIENT_SECRET)

  // const integration = await setToken(userId, token.access_token);

  // TODO - Store the token in a secure way in a way you'll can later on find it using the user ID. 
  // For example: await tokenStoreService.storeToken(userId, token);

  // Redirect back to monday
  return res.redirect('/auth/structurizr');
});

authRouter.get('/auth/structurizr', async (req, res) => {
  res.json({nice: 69});
});
