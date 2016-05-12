export const SET_COMPACT = 'SET_COMPACT';

export const setCompact = (compact) => ({ type: SET_COMPACT, compact });

export const toggleCompact = () => async (dispatch, getState) => {
  const { compact } = getState();
  dispatch(setCompact(!compact));
};
