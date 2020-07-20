interface Context {
  id: string;
  user?: any;
  params?: any;
  query?: any;
  body?: any;
  files?: any;
  cookies?: any;
}

export { Context };
