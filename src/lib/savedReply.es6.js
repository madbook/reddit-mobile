import localStorageAvailable from './localStorageAvailable';

let _saved = null;

function set(thingId, reply) {
  reply = reply && reply.trim();

  if (!reply) {
    return;
  }

  const saved = {
    thingId,
    reply,
  };

  if (localStorageAvailable()) {
    global.localStorage.setItem('savedReply', JSON.stringify(saved));
  }
  _saved = saved;
}

function get(thingId) {
  let saved = _saved;

  if (_saved) {
    saved = _saved;
  } else if (localStorageAvailable()) {
    const savedReply = global.localStorage.getItem('savedReply');

    try {
      saved = JSON.parse(savedReply);
    } catch (e) {
      return '';
    }

    _saved = saved;
  }

  if (saved && saved.thingId === thingId) {
    return saved.reply || '';
  }
}

function clear() {
  if (localStorageAvailable()) {
    global.localStorage.removeItem('savedReply');
  }
  _saved = undefined;
}

export default {
  set,
  get,
  clear,
};
