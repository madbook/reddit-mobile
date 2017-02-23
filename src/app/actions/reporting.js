import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import * as subredditRulesActions from 'app/actions/subredditRules';
import modelFromThingId from 'app/reducers/helpers/modelFromThingId';

import apiRequest from 'apiClient/apiBase/apiRequest';
import ResponseError from 'apiClient/errors/ResponseError';
import * as ModelTypes from 'apiClient/models/thingTypes';
import SubredditRule from 'apiClient/models/SubredditRule';

import includes from 'lodash/includes';

export const REPORT = 'REPORT';
export const MODAL_TYPE = 'REPORTING';

/**
 * Open the report modal for a given thing.
 * Requests subreddit rules if necessary.
 * @function
 * @param {string} thingId The fullname of the thing being reported
 */
export const report = thingId => async (dispatch, getState) => {
  const state = getState();
  const thing = modelFromThingId(thingId, state); 
  const thingType = ModelTypes.thingType(thingId);
  const usesSubredditRules = SubredditRule.doRulesApplyToThingType(thingType);
  
  const props = {
    thingId,
    thingType,
  };

  if (usesSubredditRules) {
    props.subredditName = thing.subreddit;
  }

  dispatch({
    type: REPORT,
    modalType: MODAL_TYPE,
    modalProps: props,
  });

  if (usesSubredditRules && !state.subredditRules[props.subredditName]) {
    // If this is a thing to which subreddit rules applies AND we don't have them yet,
    // go ahead and fetch them.
    // This looks a little weird because `fetchSubredditRules` is a thunked action, so
    // calling it returns a function.  We need to then call _that_ function to actually
    // kick off the request.
    const fetchRules = subredditRulesActions.fetchSubredditRules(props.subredditName);
    await fetchRules(dispatch, getState);
  }
};


export const SUBMIT = 'REPORT__SUBMIT';
export const SUCCESS = 'REPORT__SUCCESS';
export const FAILURE = 'REPORT_FAILURE';

/**
 * Submit a report
 * @function
 * @param {Report} report
 */
export const submit = report => async (dispatch, getState) => {
  dispatch({ type: SUBMIT });

  const state = getState();
  const apiOptions = apiOptionsFromState(state);
  const username = state.user.name;

  try {
    const body = {
      // 'reason' is either the shortname of a rule, or a special keyword
      // The naming in the api is... it could be better.
      reason: report.rule,
      thing_id: report.thingId,
      api_type: 'json',
    };

    // The actual report text is sent as a different key depending on the type
    // of report.  If we add "other" as an option, it would be sent as
    // `other_reason`.
    if (report.rule === SubredditRule.SITE_RULE_KEYWORD) {
      body.site_reason = report.reason;
    } else {
      body.rule_reason = report.reason;
    }

    await apiRequest(apiOptions, 'POST', 'api/report', {
      type: 'form',
      body,
    });

    const model = modelFromThingId(report.thingId, state);
    let moderatesSub = false;

    if (state.moderatingSubreddits && includes(state.moderatingSubreddits.names, model.subreddit)) {
      moderatesSub = true;
    }

    dispatch({
      type: SUCCESS,
      message: 'Thanks for letting us know!',
      model,
      report,
      username,
      moderatesSub,
    });

  } catch (e) {
    dispatch({ type: FAILURE });
    if (!(e instanceof ResponseError)) {
      throw e;
    }
  }
};
