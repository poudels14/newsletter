import lo from 'lodash';

interface ParsedEmail {
  authorEmail: string;
  authorName: string;

  newsletterName: string;
  vendorsNewsletterId: string;
  newsletterUrl: string;

  digestFrom: string;
  digestTo: string;
  digestReceivedDate: string;
  digestGmailId: string;
  digestTitle: string;
  digestContent: string;

  /** debug fields */
  deliveredTo: string;
  messageId: string;
}

const parseSender = (sender: string) => {};

const headerParser = (headers: any) => (name: string) => {
  return lo.find(headers, { name: name })?.value;
};

const htmlContent = (email: any) => {
  // Note(sagar): check if the parsed email has body
  //              it won't have body if the content is in parts
  const bodyData = email?.body?.data;
  if (!!bodyData) {
    return bodyData;
  }

  const { parts } = email;
  return lo.find(parts, { mimeType: 'text/html' })?.body?.data;
};

const parse: (email: any) => ParsedEmail = (email) => {
  const { id: digestGmailId, payload } = email;
  const headers = headerParser(payload.headers);

  const sender = headers('Sender');
  const from = headers('From');
  const to = headers('To');
  const subject = headers('Subject');
  const deliveredTo = headers('Delivered-To');
  const date = headers('Date');
  const messageId = headers('Message-Id');
  const listUrl = headers('List-Url');

  // console.log(payload);
  const content = htmlContent(payload);
  // console.log(content);

  return {
    authorEmail: sender,
    authorName: sender,

    newsletterName: 'newsletterName',
    vendorsNewsletterId: 'string',
    newsletterUrl: listUrl,

    digestFrom: from,
    digestTo: to,
    digestReceivedDate: date,
    digestGmailId,
    digestTitle: subject,
    digestContent: content,

    deliveredTo,
    messageId,
  };
};

export default { parse };
