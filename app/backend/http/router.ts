import * as uuid from 'uuid';

import { Context } from './request';
import { Response } from './response';
import express from 'express';

type Handler = (ctxt: Context, res: Response) => Promise<any>;

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

  get(path: string, middleware: any, handler: Handler): void {
    if (!handler) {
      handler = middleware;
      middleware = (req: any, res: any, next: any) => next();
    }
    this.express.get(
      path,
      middleware,
      async (req: express.Request, res: express.Response, next: () => void) => {
        handler(this.buildContext(req), res).catch(next);
      }
    );
  }

  post(path: string, middleware: any, handler: Handler): void {
    if (!handler) {
      handler = middleware;
      middleware = (req: any, res: any, next: any) => next();
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
