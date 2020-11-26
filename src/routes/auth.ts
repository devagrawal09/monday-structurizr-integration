import { Router } from 'express';

export const authRouter = Router();

authRouter.post('/auth', async (req, res) => {
  try {
    const { payload } = req.body;
    
  } finally {
    res.sendStatus(201);
  }
});
