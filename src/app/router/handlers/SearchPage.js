import { BaseHandler, METHODS } from '@r/platform/router';
import * as platformActions from '@r/platform/actions';

import { cleanObject } from 'lib/cleanObject';
import * as searchActions from 'app/actions/search';
import { fetchUserBasedData } from './handlerCommon';

import { SORTS } from 'app/sortValues';

const DEFAULT_SEARCH_TYPE = ['sr', 'link'];
const SEARCH_MIN_LENGTH = 3;
const SEARCH_MAX_LENGTH = 512;

const searchPath = (subredditOrNil) => {
  const sub = subredditOrNil ? `/r/${subredditOrNil}` : '';
  return `${sub}/search`;
};

export default class SearchPage extends BaseHandler {
  static PageParamsToSearchRequestParams({ urlParams, queryParams }) {
    const { q, after, before } = queryParams;
    const sort = queryParams.sort || SORTS.RELEVANCE;
    const time = queryParams.time || SORTS.ALL_TIME;
    const type = queryParams.type || DEFAULT_SEARCH_TYPE;
    const { subredditName } = urlParams;

    return cleanObject({
      q, after, before, sort, time, type, subreddit: subredditName,
    });
  }

  async [METHODS.GET](dispatch, getState) {
    const state = getState();
    if (state.platform.shell) { return; }

    const searchParams = SearchPage.PageParamsToSearchRequestParams(this);
    dispatch(searchActions.search(searchParams));

    fetchUserBasedData(dispatch);
  }

  async [METHODS.POST](dispatch/*, getState, utils */) {
    let { q, subreddit } = this.bodyParams;
    q = q && q.length ? q.trim() : '';

    if (q < SEARCH_MIN_LENGTH) {
      // redirect to the referrer page, maybe there
      // maybe there should be some sort of inline-error
      // telling the searcher they need to enter a longer query string
      return;
    }

    q = q.slice(0, SEARCH_MAX_LENGTH);
    dispatch(platformActions.navigateToUrl(METHODS.GET, searchPath(subreddit), {
      queryParams: { q },
    }));
  }
}
