import { objectToHash } from 'lib/objectToHash';

export const paramsToPostsListsId = (params) => {
  return objectToHash(params);
};
