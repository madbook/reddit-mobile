import * as compactActions from '../../app/actions/compact';
import { DEFAULT } from '../../app/reducers/compact';
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

  // NOTE: there was a bug were we set HTTP_ONLY cookies so the client' couldn't
  // override them. Set this cookie no matter what so httpOnly flag is removed
  // for those users affected
  ctx.cookies.set('compact', compact, permanentCookieOptions());

  const compactBool = compact === 'true';
  dispatch(compactActions.setCompact(compactBool));
};
