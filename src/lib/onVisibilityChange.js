import findKey from 'lodash/findKey';

const NOOP = () => {};

const VISIBILITY_KEYS = {
  hidden: 'visibilitychange',
  webkitHidden: 'webkitvisibilitychange',
  mozHidden: 'mozvisibilitychange',
  msHidden: 'msvisibilitychange',
};

export default (onVisible=NOOP, onHidden=NOOP) => {
  const eventKey = findKey(VISIBILITY_KEYS, (_, k) => document[k] !== undefined);

  document.addEventListener(VISIBILITY_KEYS[eventKey], () => {
    if (document[eventKey]) {
      onHidden();
    } else {
      onVisible();
    }
  });
};
