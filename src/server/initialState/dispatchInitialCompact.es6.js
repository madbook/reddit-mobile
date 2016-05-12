import * as compactActions from '../../app/actions/compactActions';
import { DEFAULT } from '../../app/reducers/compactReducer';
import { permanentCookieOptions } from './permanentCookieOptions';

export const dispatchInitialCompact = async (ctx, dispatch) => {
  const compactFromCookie = ctx.cookies.get('compact');
  const compactFromQueryParam = ctx.query.compact;
  let compact = compactFromCookie || compactFromQueryParam;

  const ua = (ctx.headers['user-agent'] || '').toLowerCase();

  // Set compact for opera mini
  if (ua && ua.match(/(opera mini|android 2)/i)) {
    compact = 'true';
  }

  if (!(compact === 'true' || compact === 'false')) {
    compact = `${DEFAULT}`;
  }

  if (compact !== compactFromCookie) {
    ctx.cookies.set('compact', compact, permanentCookieOptions());
  }

  const compactBool = compact === 'true';
  dispatch(compactActions.setCompact(compactBool));
};
