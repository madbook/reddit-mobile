import moment from 'moment';
import localStorageAvailable from './localStorageAvailable';

const TIME_LIMIT = 2;
const TIME_INTERVAL = 'weeks';

export function shouldShowBanner() {
  if (!localStorageAvailable()) { return false; }

  const lastClosedStr = localStorage.getItem('bannerLastClosed');
  const lastClosed = lastClosedStr ? moment(lastClosedStr) : null;

  // if the user closed the banner less than two weeks ago, don't show it
  if (lastClosed && moment() < lastClosed.add(TIME_LIMIT, TIME_INTERVAL)) {
    return false;
  }

  return true;
}

export function markBannerClosed() {
  if (!localStorageAvailable()) { return false; }

  // note that we dismissed the banner
  localStorage.setItem('bannerLastClosed', moment());
}
