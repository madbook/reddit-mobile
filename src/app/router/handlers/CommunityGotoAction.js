import { BaseHandler, METHODS } from 'platform/router';
import * as communityGotoActions from 'app/actions/communityGoto';

export default class CommunityGotoAction extends BaseHandler {
  async [METHODS.POST](dispatch) {
    const location = (this.bodyParams.location || '').trim();
    dispatch(communityGotoActions.gotoSubreddit(location));
  }
}
