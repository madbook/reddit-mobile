import localStorageAvailable from './localStorageAvailable';
import { generateBranchLink } from 'lib/branch';

const TWO_WEEKS = 2 * 7 * 24 * 60 * 60 * 1000;

export function getDeepLink(state) {
  return generateBranchLink(state);
}

export function shouldShowBanner() {
  // Most of the decision for showing a cross-promo component will happen in
  // the featureFlags component, but we have a couple of things to consider
  // here.

  // Make sure local storage exists
  if (!localStorageAvailable()) { return false; }

  // Check if it's been dismissed recently
  const lastClosedStr = localStorage.getItem('bannerLastClosed');
  const lastClosed = lastClosedStr ? new Date(lastClosedStr).getTime() : 0;
  const lastClosedLimit = lastClosed + TWO_WEEKS;
  if (lastClosedLimit > Date.now()) {
    return false;
  }

  return true;
}

export function markBannerClosed() {
  if (!localStorageAvailable()) { return false; }

  // note that we dismissed the banner
  localStorage.setItem('bannerLastClosed', new Date());
}
