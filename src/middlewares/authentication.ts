import { verify } from 'jsonwebtoken';
import { findIntegration } from '../database/integration';

export async function authenticationMiddleware(req: any, res: any, next: any) {
  try {
    let { authorization } = req.headers;
    if (!authorization && req.query) {
      authorization = req.query.token;
    }
    const { userId } = verify(
      authorization,
      process.env.MONDAY_SIGNING_SECRET!
    ) as any;

    const integration = await findIntegration(userId);
    if(!integration) {
      throw new Error(`Unauthorized`);
    }

    req.session = { integration };
    next();
  } catch (err) {
    res.status(401).json({ error: err.message || `not authenticated` });
  }
};
