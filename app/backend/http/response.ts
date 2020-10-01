interface Response {
  send: (data: string | number) => void;
  sendStatus: (status: number) => void;
  json: (data: unknown) => void;
  cookie: (
    key: string,
    value: string,
    options: Record<string, unknown>
  ) => void;
}

export { Response };
