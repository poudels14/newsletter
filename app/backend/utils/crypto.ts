import AES from 'crypto-js/aes';
import UTF8 from 'crypto-js/enc-utf8';

const encrypt = (data: string, password: string): string => {
  return AES.encrypt(data, password).toString();
};

const decrypt = (cipher: string, password: string): string => {
  return AES.decrypt(cipher, password).toString(UTF8);
};

export const crypto = {
  encrypt,
  decrypt,
};
