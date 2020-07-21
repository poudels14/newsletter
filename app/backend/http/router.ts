import * as uuid from 'uuid';

import { Context } from './request';
import { Response } from './response';
import express from 'express';

type Middleware = (req: unknown, res: unknown, next: () => void) => void;
type Handler = (ctxt: Context, res: Response) => Promise<void>;

class Router {
  express: express.Application;

  constructor() {
    this.express = express();
  }

  private buildContext(req: express.Request): Context {
    return {
      id: uuid.v4(),
      user: req.user,
      params: req.params,
      query: req.query,
      body: req.body,
      cookies: req.cookies,
    };
  }

  get(path: string, middleware: Middleware, handler: Handler): void {
    if (!handler) {
      handler = middleware as Handler;
      middleware = (req, res, next) => next();
    }
    this.express.get(
      path,
      middleware,
      async (req: express.Request, res: express.Response, next: () => void) => {
        handler(this.buildContext(req), res).catch(next);
      }
    );
  }

  post(path: string, middleware: Middleware, handler: Handler): void {
    if (!handler) {
      handler = middleware as Handler;
      middleware = (req, res, next) => next();
    }
    this.express.post(
      path,
      async (req: express.Request, res: express.Response, next: () => void) => {
        handler(this.buildContext(req), res).catch(next);
      }
    );
  }
}

export { Router };
