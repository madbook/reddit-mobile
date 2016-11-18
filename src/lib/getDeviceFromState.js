import { find } from 'lodash/collection';

export const ANDROID = 'Android';
export const IPHONE = 'iPhone';
export const IPAD = 'iPad';
export const WINDOWS_PHONE = 'Windows Phone';

export const IOS_DEVICES = [IPHONE, IPAD];

export const RECOGNIZED_DEVICES = [ANDROID, IPHONE, IPAD, WINDOWS_PHONE];

// We should move to a full-featured and tested UA-parsing library the next
// time we need to adjust this logic.
export function getDevice(state) {
  const ua = state.meta.userAgent || '';
  
  // IE on Windows Phone has many misleading tokens in the User Agent string.
  // We explicitly try to match it first to avoid false positive matches for
  // Android or iOS.
  if (ua.indexOf(WINDOWS_PHONE) !== -1) {
    return WINDOWS_PHONE;
  }

  return find(RECOGNIZED_DEVICES, device => ua.indexOf(device) !== -1);
}
