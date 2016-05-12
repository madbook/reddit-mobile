export const SET_SESSION = 'SESSION__SET_SESSION';

export const setSession = session => ({
  type: SET_SESSION,
  payload: { session },
});
