export const SET_LOID = 'SET_LOID';

export const setLOID = ({ loid, loidCookie, loidCreated, loidCreatedCookie }) => ({
  type: SET_LOID,
  loid,
  loidCookie,
  loidCreated,
  loidCreatedCookie,
});
