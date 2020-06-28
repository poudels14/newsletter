interface Context {
  id: string;
  user?: any;
  query?: any;
  body?: any;
  files?: any;
  cookies?: any;
}

export { Context };
