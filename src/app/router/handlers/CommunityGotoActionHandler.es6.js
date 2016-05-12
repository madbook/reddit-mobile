import { BaseHandler, METHODS } from '@r/platform/router';
import * as communityGotoActions from '../../actions/communityGotoActions';

export default class CommunityGotoActionHandler extends BaseHandler {
  async [METHODS.POST](disaptch) {
    const location = (this.bodyParams.location || '').trim();
    disaptch(communityGotoActions.gotoLocation(location));
  }
}
