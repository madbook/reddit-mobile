import { BaseHandler, METHODS } from '@r/platform/router';
import * as platformActions from '@r/platform/actions';
import { urlWith } from 'lib/urlWith';

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

const SORT = 'sort';
const TIME = 't';
const TYPE = 'type';

const DEFUALT_PARAMS = {
  [SORT]: SORTS.RELEVANCE,
  [TIME]: SORTS.ALL_TIME,
  [TYPE]: DEFAULT_SEARCH_TYPE,
};

const getDefaultable = (name, queryParams) => {
  return queryParams[name] || DEFUALT_PARAMS[name];
};

const removeDefaultables = (params) => {
  const newObject = {};
  const keys = Object.keys(params);
  keys.forEach(key => {
    const value = params[key];
    if (value && value === DEFUALT_PARAMS[key]) {
      return;
    }

    newObject[key] = value;
  });

  return newObject;
};

export default class SearchPage extends BaseHandler {
  static pageParamsToSearchRequestParams({ urlParams, queryParams }) {
    const { q, after, before } = queryParams;
    const sort = getDefaultable(SORT, queryParams);
    const t = getDefaultable(TIME, queryParams);
    const type = getDefaultable(TYPE, queryParams);
    const { subredditName } = urlParams;

    return cleanObject({
      q, after, before, sort, t, type, subreddit: subredditName,
    });
  }

  static buildURL(urlParams, params) {
    const filteredParams = removeDefaultables(params);
    return urlWith(searchPath(urlParams.subredditName), cleanObject(filteredParams));
  }

  async [METHODS.GET](dispatch, getState) {
    const state = getState();
    if (state.platform.shell) { return; }

    const searchParams = SearchPage.pageParamsToSearchRequestParams(this);
    const { q: query } = searchParams;
    if (query && query.length > SEARCH_MIN_LENGTH) {
      dispatch(searchActions.search(searchParams));
    }

    fetchUserBasedData(dispatch);
  }

  async [METHODS.POST](dispatch/*, getState, utils */) {
    const { subreddit } = this.bodyParams;
    let { q } = this.bodyParams;
    q = q && q.length ? q.trim() : '';

    if (q.length < SEARCH_MIN_LENGTH) {
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
