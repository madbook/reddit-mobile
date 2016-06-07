import { BaseHandler, METHODS } from '@r/platform/router';
import * as communityGotoActions from 'app/actions/communityGoto';

export default class CommunityGotoAction extends BaseHandler {
  async [METHODS.POST](dispatch) {
    const location = (this.bodyParams.location || '').trim();
    dispatch(communityGotoActions.gotoSubreddit(location));
  }
}
