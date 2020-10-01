interface Response {
  send: (data: string | number) => void;
  sendStatus: (status: number) => void;
  json: (data: Record<string, unknown>) => void;
  cookie: (
    key: string,
    value: string,
    options: Record<string, unknown>
  ) => void;
}

export { Response };
