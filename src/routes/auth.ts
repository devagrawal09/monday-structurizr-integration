import { Router } from 'express';
import * as jwt from 'jsonwebtoken';
import Monday from 'monday-sdk-js';
import './monday';

export const authRouter = Router();

const monday = Monday();

authRouter.post('/auth', async (req, res) => {
  const { token } = req.query;
  return res.redirect('https://auth.monday.com/oauth2/authorize?client_id=1a2d07d4c9b32a8ce4578ee9a75bfd22');
});

authRouter.post('/oauth/callback', async (req, res) => {
  const { code, state } = req.query;
  const { userId, accountId, backToUrl } = jwt.verify(state as string, process.env.MONDAY_CLIENT_SECRET!) as any;

  // Get access token
  const token = await monday.oauthToken(code, process.env.MONDAY_CLIENT_ID, process.env.MONDAY_CLIENT_SECRET)
  
  // TODO - Store the token in a secure way in a way you'll can later on find it using the user ID. 
  // For example: await tokenStoreService.storeToken(userId, token);

  // Redirect back to monday
  return res.redirect(backToUrl);
});
