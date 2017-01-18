import { combineReducers } from 'redux';

import collapsed from './collapsed';
import continueThread from './continueThread';
import data from './data';
import loadMore from './loadMore';
import loadMorePending from './loadMorePending';

/**
* Reducer for all things comments. Includes comments/data.
* @module reducers/comments
**/
export default combineReducers({
  collapsed,
  continueThread,
  data,
  loadMore,
  loadMorePending,
});
