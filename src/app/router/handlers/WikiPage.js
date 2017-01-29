import { BaseHandler, METHODS } from 'platform/router';
import * as subredditActions from 'app/actions/subreddits';
import * as wikiActions from 'app/actions/wiki';
import { fetchUserBasedData } from './handlerCommon';

export default class WikiPage extends BaseHandler {
  async [METHODS.GET](dispatch, getState/*, utils*/) {
    const state = getState();
    if (state.platform.shell) { return; }

    const { subredditName, path } = this.urlParams;
    if (subredditName) {
      dispatch(subredditActions.fetchSubreddit(subredditName));
    }
    dispatch(wikiActions.fetch({subredditName, path}));
    fetchUserBasedData(dispatch);
  }
}
