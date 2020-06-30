import lo from 'lodash';
import Base64 from 'js-base64';
import regex from 'xregexp';

const emailAddressRegexp = regex(
  `(?<name> [^<]+ )? -?  # name
  (["]?)
   <(?<email> (.+) )> -? # email address`,
  'giuyx'
);

const parseEmailAddress = (address: string) => {
  const match = regex.exec(address, emailAddressRegexp);
  if (!match) {
    console.error("Couldn't parse email address:", address);
    return {};
  }

  const { name, email } = match;
  const sanitizedName = name?.trim();
  const quotesRemoved = sanitizedName?.replace(
    /"/g,
    (character: string, index: number) => {
      return index === 0 || index === sanitizedName.length - 1 ? '' : character;
    }
  );

  return {
    name: quotesRemoved,
    email,
  };
};

function camelize(str: string) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
}

const parseNewsletter = (payload: any) => {
  // Note(sagar): check if the parsed email has body
  //              it won't have body if the content is in parts
  let data = payload?.body?.data;
  if (!data) {
    data = lo.find(payload.parts, { mimeType: 'text/html' })?.body?.data;
  }

  return {
    base64: data,
    html: Base64.decode(data),
  };
};

const parseHeaders = (gmailId: string, headers: any) => {
  const keyValuesList = headers.map((h: any) => {
    const key = camelize(h.name.replace('-', ''));
    return { [key]: h.value };
  });

  const mergedObject = lo.reduce(
    keyValuesList,
    (collection: any, n: any) => {
      return lo.merge(collection, n);
    },
    {}
  );

  return {
    ...mergedObject,
    base64Headers: Base64.encode(JSON.stringify(mergedObject)),
  };
};

export default { parseHeaders, parseNewsletter, parseEmailAddress };
