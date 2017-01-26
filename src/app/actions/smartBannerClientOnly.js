import { generateBranchLink } from 'lib/branch';
import { hasMobileApp } from 'lib/branchClientOnly';
import { shouldShowBanner } from 'lib/smartBannerState';
import { show } from 'app/actions/smartBanner';

// The branch-sdk module makes an assumption that it runs in a browser
// environment, even just on load, so we cannot import it on the server. Right
// now we import all of the reducers on the server, though, and they in turn
// need access to the smartBanner actions. So we separate the checkAndSet bound
// action creator (which has a branch dependency) from the other smartBanner
// action code, so we can confine branch-sdk to the client.
export const checkAndSet = () => async (dispatch, getState) => {
  const state = getState();
  if (!shouldShowBanner() || await hasMobileApp()) {
    return;
  }
  const link = generateBranchLink(state);
  dispatch(show(link));
};
