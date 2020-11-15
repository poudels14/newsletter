import express from 'express';
import { User } from './request';
import { Response } from './response';
import jwt from 'jsonwebtoken';

interface UserCookie {
  id: string;
  exp?: number;
}

const setUser = (res: Response, user: UserCookie): void => {
  const token = jwt.sign(user, process.env.LOGIN_COOKIE_SIGNING_KEY);
  res.cookie('logged-user', token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });
};

type GetUser = (req: express.Request) => Promise<User>;
const getUser: GetUser = (req) => {
  return new Promise((resolve) => {
    // TODO(sagar): make sure the expired tokens are invalid
    jwt.verify(
      req.cookies['logged-user'],
      process.env.LOGIN_COOKIE_SIGNING_KEY,
      (err: Error, user: User) => {
        if (err) {
          resolve({});
        } else {
          resolve(user);
        }
      }
    );
  });
};

type AuthorizedOnly = () => (
  req: express.Request,
  res: Response,
  next: () => void
) => Promise<void>;
const authorizedOnly: AuthorizedOnly = () => async (req, res, next) => {
  getUser(req)
    .catch(() => res.sendStatus(403))
    .then((user: User) => {
      if (user?.id) {
        next();
      } else {
        res.sendStatus(403);
      }
    });
};

export const Cookies = { getUser, setUser, authorizedOnly };
