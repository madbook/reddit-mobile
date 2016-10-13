import frames from './frames';
import { GTM_JAIL_ID } from 'app/constants';

export const getGTMJail = () => document.getElementById(GTM_JAIL_ID);

export const trigger = (eventName, payload) => {
  const jailEl = getGTMJail();
  if (!jailEl) { return; }

  if (payload) {
    set(payload);
  }

  frames.postMessage(jailEl.contentWindow, 'event.gtm', {
    event: eventName,
  });
};


export const set = data => {
  const jailEl = getGTMJail();
  if (jailEl) {
    frames.postMessage(jailEl.contentWindow, 'data.gtm', data);
  }
};
