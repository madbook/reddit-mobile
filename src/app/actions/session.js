export const SET_SESSION = 'SESSION__SET_SESSION';
export const SESSION_ERROR = 'SESSION__SESSION_ERROR';

export const setSession = session => ({
  type: SET_SESSION,
  payload: { session },
});

// Send the error text or null to clear the error.
export const sessionError = error => ({
  type: SESSION_ERROR,
  payload: { error },
});
