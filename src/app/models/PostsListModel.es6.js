import { objectToHash } from '../../utils/objectToHash';
import { omit } from 'lodash/object';

export const paramsToPostsListsParams = (params) => {
  return omit(params, 'before', 'after');
};

export const paramsToPostsListsId = (params) => {
  return objectToHash(paramsToPostsListsParams(params));
};

export const newPostsList = (id, params) => ({
  id,
  params,
  loading: true,
  loadingMore: false,
  results: [],
});
