import { Context } from './request';
import { Response } from './response';
import jwt from 'jsonwebtoken';

interface UserCookie {
  id: string;
  exp: string;
}

const setUser = (res: Response, user: UserCookie) => {
  const token = jwt.sign(user, process.env.LOGIN_COOKIE_SIGNING_KEY);
  res.cookie('logged-user', token, { maxAge: 604800, httpOnly: true });
};

type GetUser = (req: Context) => Promise<any>;
const getUser: GetUser = (req) => {
  return new Promise((resolve, reject) => {
    // TODO(sagar): make sure the expired tokens are invalid
    jwt.verify(
      req.cookies['logged-user'],
      process.env.LOGIN_COOKIE_SIGNING_KEY,
      (err: any, user: any) => {
        if (err) {
          console.error(err);
          resolve(null);
        } else {
          resolve({ id: user.id });
        }
      }
    );
  });
};

type AuthorizedOnly = () => (
  req: Context,
  res: Response,
  next: any
) => Promise<void>;
const authorizedOnly: AuthorizedOnly = () => async (req, res, next) => {
  getUser(req)
    .catch((err) => res.sendStatus(403))
    .then((user) => {
      if (!!user) {
        req.user = user;
        next();
      } else {
        res.sendStatus(403);
      }
    });
};

export const Cookies = { getUser, setUser, authorizedOnly };
