/**
 * @module middleware/ravenLogger
 * This module is responsible for:
 *  * CLIENT: adding extra breadcrumbs based off redux actions
 *  * CLIENT: updating Raven's context based off redux state as actions complete
 *  * SERVER/CLIENT: capturing exceptions from async actions that are caught in errorLogger.js
 *  *   and thus not seen in the handler for unhandled promises (chrome only) 
 */

import logSafeJSONStringify from 'lib/logSafeJSONStringify';

export default raven => store => next => action => {
  if (process.env.ENV === 'client') {
    if (typeof action === 'object') {
      raven.captureBreadcrumb({
        message: action.type,
        category: 'redux-action',
      });
    }

    // Add some redux context to Raven
    const state = store.getState();

    // use logSafeJSONStringify to ensure we remove user sensitive fields
    // unfortunately we need to re-convert to JSON afterwards
    raven.setUserContext(JSON.parse(logSafeJSONStringify({
      pageInfo: state.platform,
      user: state.user,
    })));
  }

  const result = next(action);
  if (result instanceof Promise) {
    result.catch(error => {
      raven.captureException(error);
    });
  } 
  return result;
};
