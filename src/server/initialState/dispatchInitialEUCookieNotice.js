import * as euCookieActions from 'app/actions/euCookieNotice';
import EUCountries from 'lib/EUCountries';

// NOTE: This depends on `state.meta.country` being set before this is called
export default function(ctx, dispatch, getState) {
  const numberOfTimesShown = parseInt(ctx.cookies.get('EUCookieNotice'), 10) || 0;
  const isEUCountry = EUCountries.has(getState().meta.country);

  dispatch(euCookieActions.set(isEUCountry, numberOfTimesShown));
}
