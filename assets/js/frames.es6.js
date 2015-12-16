const ALLOW_WILDCARD = '.*';
const DEFAULT_MESSAGE_NAMESPACE = '.postMessage';
const DEFAULT_POSTMESSAGE_OPTIONS = {
  targetOrigin: '*',
};
const RE_HAS_NAMESPACE = /\..+$/;

let allowedOrigins = [ALLOW_WILDCARD];
let re_postMessageAllowedOrigin = compileOriginRegExp(allowedOrigins);
let messageNamespaces = [DEFAULT_MESSAGE_NAMESPACE];
let re_messageNamespaces = compileNamespaceRegExp(messageNamespaces);
let proxies = {};
let listening = false;

function receiveMessage(e) {
  if (e.origin !== global.location.origin &&
      !re_postMessageAllowedOrigin.test(e.origin)
      && e.origin !== 'null') {
    return;
  }


  let message = JSON.parse(e.data);
  let type = message.type;

  // Namespace doesn't match, ignore
  if (!re_messageNamespaces.test(type)) {
    return;
  }

  let namespace = type.split('.', 2)[1];

  if (proxies[namespace]) {
    const proxyWith = proxies[namespace];

    proxyWith.targets.forEach(function(target) {
      frames.postMessage(target, type, message.data, message.options);
    });
  }

  const customEvent = new CustomEvent(type, {detail: message.data});
  customEvent.source = e.source;

  global.dispatchEvent(customEvent);
}

function _addEventListener(type, handler, useCapture) {
  if (global.addEventListener) {
    global.addEventListener(type, handler, useCapture);
  } else if (global.attachEvent) {
    global.attachEvent(`on${type}`, handler);
  }
}

function _removeEventListener(type, handler) {
  if (global.removeEventListener) {
    global.removeEventListener(type, handler);
  } else if (global.detachEvent) {
    global.detachEvent(`on${type}`, handler);
  }
}

function compileOriginRegExp(origins) {
  return new RegExp('^http(s)?:\\/\\/' + origins.join('|') + '$', 'i');
}

function compileNamespaceRegExp(namespaces) {
  return new RegExp('\\.(?:' + namespaces.join('|') + ')$');
}

function isWildcard(origin) {
  return /\*/.test(origin);
}

/** @module frames */
/* @example
 * // parent window
 * // frames.listen('dfp')
 * // frames.receiveMessageOnce('init.dfp', callback)
 * @example
 * // iframe
 * // frames.postMessage(window.parent, 'init.dfp', data);
 */
const frames = {
  /*
   * Send a message to another window.
   * param {Window} target The frame to deliver the message to.
   * param {String} type The message type. (if it doesn't include a namespace
      the default namespace will be used)
   * param {Object} data The data to send.
   * param {Object} options The `postMessage` options.
   * param {String} options.targetOrigin Specifies what the origin of
      otherWindow must be for the event to be dispatched.
   */
  postMessage(target, type, data, options) {
    if (!RE_HAS_NAMESPACE.test(type)) {
      type += DEFAULT_MESSAGE_NAMESPACE;
    }

    options = options || {};
    for (let key in DEFAULT_POSTMESSAGE_OPTIONS) {
      if (!options.hasOwnProperty(key)) {
        options[key] = DEFAULT_POSTMESSAGE_OPTIONS[key];
      }
    }

    target.postMessage(JSON.stringify({
      type,
      data,
      options,
    }), options.targetOrigin);
  },

  /*
   * Receive a message from another window.
   * param {Window} [source] The frame to that send the message.
   * param {String} type The message type. (if it doesn't include a namespace
      the default namespace will be used)
   * param {Function} callback The callback to invoke upon retrieval.
   * param {Object} [context=this] The context the callback is invoked with.
   * returns {Object} The listener.
   */
  receiveMessage(source, type, callback, context) {
    if (typeof source === 'string') {
      context = callback;
      callback = type;
      type = source;
      source = null;
    }

    context = context || this;

    let scoped = function(e) {
      if (source &&
          source !== e.source &&
          source.contentWindow !== e.source) {
        return;
      }

      callback.apply(context, arguments);
    };

    _addEventListener(type, scoped);

    return {
      off() { _removeEventListener(type, scoped); },
    };
  },

  /*
   * Proxies messages on a namespace from a frame to a specified target.
   * param {String} namespace The namespace to proxy.
   * targets {Array<Window>} [source] The frames to proxy messages to.
   *  NOTE: supports a single frame as well.
   */
  proxy(namespace, targets) {
    this.listen(namespace);

    if (!Array.isArray(targets)) {
      targets = [targets];
    }

    let namespaceProxies = proxies[namespace];

    if (namespaceProxies) {
      namespaceProxies.targets = [].concat(namespaceProxies.targets, targets);
    } else {
      namespaceProxies = {
        targets,
      };
    }

    proxies[namespace] = namespaceProxies;
  },

  /*
   * Receive a message from another window once.
   * param {Window} [source] The frame to that send the message.
   * param {String} type The message type. (if it doesn't include a namespace
      the default namespace will be used)
   * param {Function} callback The callback to invoke upon retrieval.
   * param {Object} [context=this] The context the callback is invoked with.
   * returns {Object} The listener.
   */
  receiveMessageOnce(source, type, callback, context) {
    const listener = frames.receiveMessage(source, type, function() {
      if (callback) { callback.apply(this, arguments); }

      listener.off();
    }, context);

    return listener;
  },

  /*
   * Adds an allowed origin to be listened to.
   * param {String} origin The origin to be added.
   */
  addPostMessageOrigin(origin) {
    if (isWildcard(origin)) {
      allowedOrigins = [ALLOW_WILDCARD];
    } else if (allowedOrigins.indexOf(origin) === -1) {
      frames.removePostMessageOrigin(ALLOW_WILDCARD);

      allowedOrigins.push(origin);

      re_postMessageAllowedOrigin = compileOriginRegExp(allowedOrigins);
    }
  },

  /*
   * Removes an origin from the list of those listened to.
   * param {String} origin The origin to be removed.
   */
  removePostMessageOrigin(origin) {
    let index = allowedOrigins.indexOf(origin);

    if (index !== -1) {
      allowedOrigins.splice(index, 1);

      re_postMessageAllowedOrigin = compileOriginRegExp(allowedOrigins);
    }
  },

  /*
   * Listens to messages on of the specified namespace.
   * param {String} namespace The namespace to be listened to.
   */
  listen(namespace) {
    if (messageNamespaces.indexOf(namespace) === -1) {
      messageNamespaces.push(namespace);
      re_messageNamespaces = compileNamespaceRegExp(messageNamespaces);
    }

    if (!listening) {
      _addEventListener('message', receiveMessage);

      listening = true;
    }
  },

  /*
   * Stops listening to messages on of the specified namespace.
   * param {String} namespace The namespace to stop listening to.
   */
  stopListening(namespace) {
    let index = messageNamespaces.indexOf(namespace);

    if (index !== -1) {
      messageNamespaces.splice(index, 1);

      if (messageNamespaces.length) {
        re_messageNamespaces = compileNamespaceRegExp(messageNamespaces);
      } else {
        _removeEventListener('message', receiveMessage);
        listening = false;
      }
    }
  },

};

export default frames;
