import * as sessionActions from './session';

export const SESSION_REFRESHING = 'SESSION_REFRESHING';
export const refreshing = () => ({ type: SESSION_REFRESHING });

export const SESSION_REFRESHED = 'SESSION_REFRESHED';
export const refreshed = () => ({ type: SESSION_REFRESHED });

export const refresh = () => async (dispatch, getState) => {
  const { sessionRefreshing, session } = getState();
  // note, we shouldn't check session.isvalid here becuase
  // then we wouldn't be able to pre-emptively refresh
  if (!session.refresh || sessionRefreshing) { return; }

  dispatch(refreshing());
  try {
    const newSession = await session.refresh();
    dispatch(sessionActions.setSession(newSession));
    dispatch(refreshed());
  } catch (e) {
    dispatch(refreshed());

    // retry, only once, somewhere between 1 and 3 seconds later
    setTimeout(() => dispatch(refresh()), Math.floor(1000 + Math.random() * 1000));
  }
};
