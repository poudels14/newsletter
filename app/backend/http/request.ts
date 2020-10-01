interface Context {
  id: string;
  user?: Record<string, string>;
  params?: Record<string, unknown>;
  query?: Record<string, unknown>;
  body?: Record<string, unknown>;
  files?: Record<string, unknown>;
  cookies?: Record<string, unknown>;
}

export { Context };
