import frames from './frames';
import { GTM_JAIL_ID } from 'app/constants';

import config from 'config';

// We load the GTM Iframe when the page finishes loading, this helps
// prevent sluggish RUM timings. Iframes load asyncronously but
// they block DOMContentLoaded events.
let PENDING_GTM_EVENTS = [];

export const initGoogleTagManager = initialSubredditName => {
  if (window.DO_NOT_TRACK) {
    return;
  }

  const { mediaDomain, googleTagManagerId } = config;
  if (!googleTagManagerId) {
    return;
  }

  const gtmJail = document.createElement('iframe');
  gtmJail.style.display = 'none';
  gtmJail.id = GTM_JAIL_ID;
  gtmJail.name = JSON.stringify({
    subreddit: initialSubredditName || '',
    origin: location.origin,
    pathname: location.pathname,
  });

  gtmJail.src = `https://${mediaDomain}/gtm/jail?id=${googleTagManagerId}`;
  gtmJail.onload = processPendingGTMQueue;

  document.body.appendChild(gtmJail);
};

const processPendingGTMQueue = () => {
  const jailEL = getGTMJail();
  if (!jailEL) { return; } // we aren't loaded yet

  // Explicitly copy the pending events to a new array and clear the queue.
  // `trigger` appends to PENDING_GTM_EVENTS so this is to prevent any issues
  // such as the queue growing forever (although that shouldn't happen)
  const pendingEvents = PENDING_GTM_EVENTS.slice();
  PENDING_GTM_EVENTS = [];

  pendingEvents.forEach(({ eventName, payload }) => trigger(eventName, payload));
};

const queueGTMEvent = (eventName, payload) => {
  PENDING_GTM_EVENTS.push({ eventName, payload });
};

export const getGTMJail = () => {
  const jailEL = document.getElementById(GTM_JAIL_ID);
  return jailEL && jailEL.contentWindow ? jailEL : null;
};

export const trigger = (eventName, payload) => {
  const jailEl = getGTMJail();

  // Make sure GTM is loaded, it might not be ready since we load asyncronously
  if (!jailEl) {
    queueGTMEvent(eventName, payload);
    return;
  }

  if (payload) {
    frames.postMessage(jailEl.contentWindow, 'data.gtm', payload);
  }

  frames.postMessage(jailEl.contentWindow, 'event.gtm', {
    event: eventName,
  });
};
