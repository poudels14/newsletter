export interface User {
  id?: string;
}

export interface Context {
  id: string;
  // Note(sagar): the info of returned user is used to fetch data from db
  getAppUser?: () => Promise<User>;
  params?: Record<string, unknown>;
  query?: Record<string, unknown>;
  body?: Record<string, unknown>;
  files?: Record<string, unknown>;
  cookies?: Record<string, unknown>;
}
