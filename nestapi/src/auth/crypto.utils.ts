import * as crypto from 'node:crypto';

export const sha1Encode = (str: string) => {
  return crypto.createHash('sha1').update(str).digest('hex');
};
