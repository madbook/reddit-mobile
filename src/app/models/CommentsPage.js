import { objectToHash } from 'lib/objectToHash';

export const paramsToCommentsPageParams = (params) => {
  // use this for caching and de-duping later
  return params;
};

export const paramsToCommentsPageId = (params) => {
  return objectToHash(paramsToCommentsPageParams(params));
};

export const newCommentsPage = (id, params) => ({
  id,
  params,
  postId: params.id,
  loading: true,
  loadingMoreChildren: {},
  results: [],
});
