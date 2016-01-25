import frames from './frames';

export default {
  trigger(eventName, payload) {
    const jailEl = document.getElementById('gtm-jail');
    if (jailEl) {
      if (payload) {
        this.set(payload);
      }

      frames.postMessage(jailEl.contentWindow, 'event.gtm', {
        event: eventName,
      });
    }
  },

  set(data) {
    const jailEl = document.getElementById('gtm-jail');
    if (jailEl) {
      frames.postMessage(jailEl.contentWindow, 'data.gtm', data);
    }
  },
};
