import sha1 from 'sha1';
import stableJSONStringify from 'json-stable-stringify';

export const objectToHash = (obj = {}) => {
  return sha1(stableJSONStringify(obj) || '');
};
