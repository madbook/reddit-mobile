import { objectToHash } from 'lib/objectToHash';
// import { omit } from 'lodash/object';

export const paramsToPostsListsParams = (params) => {
  return params;
  // return omit(params, 'before', 'after'); if we want infinite scroll, do something like this
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
