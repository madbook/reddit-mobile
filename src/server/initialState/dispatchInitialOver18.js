import * as preferenceActions from 'app/actions/preferences';

export const dispatchInitialOver18 = (ctx, dispatch) => {
  const over18FromCookie = ctx.cookies.get('over_18');
  if (over18FromCookie === 'true') {
    dispatch(preferenceActions.isOver18());
  }
};
