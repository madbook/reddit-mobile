import frames from './frames';

let jail = document.getElementById('gtm-jail');

let gtm = {

  trigger(eventName, payload) {
    if (payload) {
      this.set(payload);
    }

    frames.postMessage(jail.contentWindow, 'event.gtm', {
      event: eventName,
    });
  },

  set(data) {
    frames.postMessage(jail.contentWindow, 'data.gtm', data);
  },

};

export default gtm;
