import { Request } from './request';
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

type GetUser = (req: Request) => Promise<any>;
const getUser: GetUser = (req) => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      req.cookies['logged-user'],
      process.env.LOGIN_COOKIE_SIGNING_KEY,
      (err: any, user: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(user);
        }
      }
    );
  });
};

type AuthorizedOnly = () => (req: Request, res: Response, next: any) => void;
const authorizedOnly: AuthorizedOnly = () => async (req, res, next) => {
  getUser(req)
    .then((user) => next())
    .catch((err) => res.send(401));
};

export const Cookies = { getUser, setUser, authorizedOnly };
