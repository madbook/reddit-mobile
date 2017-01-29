import { BaseHandler, METHODS } from 'platform/router';
import { cleanObject } from 'lib/cleanObject';
import { SORTS } from 'app/sortValues';
import * as hiddenActions from 'app/actions/hidden';
import * as savedActions from 'app/actions/saved';
import { fetchUserBasedData } from './handlerCommon';

const SAVED = 'saved';
const HIDDEN = 'hidden';

export default class SavedAndHiddenHandler extends BaseHandler {
  static isSavedPage({ urlParams }) { return urlParams.savedOrHidden === SAVED; }
  static isHiddenPage({ urlParams }) { return urlParams.savedOrHidden === HIDDEN; }

  static pageParamsToSavedParams({ urlParams, queryParams }) {
    const { userName } = urlParams;
    const { sort=SORTS.CONFIDENCE, before, after } = queryParams;

    return cleanObject({
      user: userName,
      sort,
      before,
      after,
    });
  }

  async [METHODS.GET](dispatch, getState) {
    const state = getState();
    if (state.platform.shell) { return; }

    const params = SavedAndHiddenHandler.pageParamsToSavedParams(this);

    if (SavedAndHiddenHandler.isHiddenPage(this)) {
      dispatch(hiddenActions.fetch(params));
    } else if (SavedAndHiddenHandler.isSavedPage(this)) {
      dispatch(savedActions.fetch(params));
    }

    fetchUserBasedData(dispatch);
  }
}
