interface Response {
  send: (data: string | number) => void;
  sendStatus: (status: number) => void;
  json: (data: any) => void;
  cookie: (key: string, value: string, options: any) => void;
}

export { Response };
