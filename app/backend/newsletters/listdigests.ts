import { Context } from 'Http/request';
import { Response } from 'Http/response';
import { database } from 'Utils/postgres';

const query = async ({ newsletterId }: any) => {
  const {
    rows,
  } = await database.query(
    `SELECT * FROM newsletter_digests WHERE newsletter_id = $1`,
    [newsletterId]
  );
  return rows;
};

const listDigests = async (ctxt: Context, res: Response) => {
  // const { code } = ctxt.body;

  const rows = await query({ newsletterId: '1' });
  console.log(rows);

  res.json(rows);
};

export default listDigests;
