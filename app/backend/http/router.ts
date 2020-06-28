import express from 'express';
import * as uuid from 'uuid';

import { Context } from './request';
import { Response } from './response';

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
      query: req.query,
      body: req.body,
    };
  }

  get(path: string, handler: Handler): void {
    this.express.get(
      path,
      async (req: express.Request, res: express.Response, next: () => void) => {
        handler(this.buildContext(req), res).catch(next);
      }
    );
  }

  post(path: string, handler: Handler): void {
    this.express.post(
      path,
      (req: express.Request, res: express.Response, next: () => void) => {
        handler(this.buildContext(req), res).catch(next);
      }
    );
  }
}

export { Router };
