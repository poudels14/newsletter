import axios from 'axios';
import { knex } from 'Utils';
import { User } from 'Repos';

type AddHighlight = ({
  userId,
  highlightId,
}: {
  userId: string;
  highlightId: string;
}) => Promise<void>;
const addHighlight: AddHighlight = async ({ userId, highlightId }) => {
  const user = await User.getById(userId);
  if (user?.readwiseToken) {
    const rows = await knex('highlights AS h')
      .select('h.date')
      .select('h.content')
      .select('ue.title')
      .select('n.name as author')
      .select('h.digest_id as digest_id')
      .select('n.id as newsletter_id')
      .leftJoin('user_emails AS ue', 'ue.id', 'h.digest_id')
      .leftJoin('newsletters AS n', 'n.id', 'ue.newsletter_id')
      .where({ 'h.id': highlightId });

    const highlight = rows[0];
    const response = await axios.post(
      'https://readwise.io/api/v2/highlights/',
      {
        highlights: [
          {
            source_url: `https://app.alpinereader.com/nl/${highlight.newsletter_id}/digests/${highlight.digest_id}`,
            source_type: 'article',
            text: highlight.content,
            title: highlight.title,
            author: highlight.author,
            highlighted_at: highlight.date,
          },
        ],
      },
      {
        headers: {
          Authorization: `Token ${user.readwiseToken}`,
        },
      }
    );

    console.log('highlight ids = ', response?.data[0]?.modified_highlights);
    const readwiseId = response?.data[0]?.modified_highlights[0];
    await knex('highlights')
      .where({ id: highlightId })
      .update({ readwise_id: readwiseId });
  }
};

type DeleteHighlight = ({
  userId,
  highlightId,
}: {
  userId: string;
  highlightId: string;
}) => Promise<void>;
const deleteHighlight: DeleteHighlight = async ({ userId, highlightId }) => {
  const user = await User.getById(userId);
  if (user?.readwiseToken) {
    const rows = await knex('highlights AS h')
      .select('readwise_id')
      .where({ id: highlightId, user_id: userId });

    const highlight = rows[0];
    console.log('highlight = ', highlight);

    // const res = await axios.get(`https://readwise.io/api/v2/highlights/?page=3`,
    // {
    //   headers: {
    //     'Content-Type': "application/json",
    //     "Authorization": `Token ${user.readwiseToken}`
    //   }
    // }).catch(err => { console.log(err); throw err; });
    // console.log("GET res = ", JSON.stringify(res.data));

    await axios
      .delete(
        `https://readwise.io/api/v2/highlights/${highlight.readwise_id}/`,
        {
          headers: {
            Authorization: `Token ${user.readwiseToken}`,
          },
        }
      )
      .catch((err) => {
        console.log(err);
        throw err;
      });
  }
};

export default {
  addHighlight,
  deleteHighlight,
};
