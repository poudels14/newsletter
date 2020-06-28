import fs from 'fs';
import * as uuid from 'uuid';
import axios from 'axios';

const testStorage = () => async (req: any) => {
  const { data } = await axios.post(
    `${process.env.NEWSLETTERS_STATIC_SERVER}/newsletters/upload`,
    {
      relativePath: req.relativePath,
      content: req.content,
    }
  );
  return data.uri;
};

type Store = (relativePath: string, content: string) => Promise<string>;
const store: Store = async (relativePath, content) => {
  return await testStorage()({
    relativePath,
    content,
  });
};

export const storage = { store };
