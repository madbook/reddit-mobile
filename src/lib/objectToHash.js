import sha1 from 'crypto-js/sha1';
import stableJSONStringify from 'json-stable-stringify';

export const objectToHash = (obj = {}) => {
  return sha1(stableJSONStringify(obj) || '').toString();
};
