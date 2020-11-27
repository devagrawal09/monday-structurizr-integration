import { verify } from 'jsonwebtoken';

export async function authenticationMiddleware(req: any, res: any, next: any) {
  try {
    let { authorization } = req.headers;
    if (!authorization && req.query) {
      authorization = req.query.token;
    }
    const { accountId, userId, backToUrl } = verify(
      authorization,
      process.env.MONDAY_SIGNING_SECRET!
    ) as any;

    console.log({ accountId, userId, backToUrl });

    req.session = { accountId, userId, backToUrl };
    next();
  } catch (err) {
    res.status(500).json({ error: 'not authenticated' });
  }
};
