import superagent from 'superagent';
import ReactDOM from 'react-dom';
import throttle from 'lodash/function/throttle';

import errorLog from '../../src/lib/errorLog';
import constants from '../../src/constants';
import getTimes from '../../src/lib/timing';

import config from '../../src/config';

export function stringifyElement($el) {
  const $linkClone = $el.cloneNode(true);
  const $tmpWrapper = document.createElement('div');
  $tmpWrapper.appendChild($linkClone);

  return $tmpWrapper.innerHTML;
}

export function stopScroll(elClass, delay=50) {
  return throttle(function stopScroll(e) {
    let touchMoveAllowed = false;
    let target = e.target;

    while (target !== null) {
      if (target.classList && target.classList.contains(elClass)) {
        if (elementCanScroll(target)) {
          touchMoveAllowed = true;
        }
        break;
      }

      target = target.parentNode;
    }

    if (!touchMoveAllowed) {
      e.preventDefault();
    }
  }, delay);
}

function elementCanScroll(el) {
  const top = el.scrollTop;

  if (top <= 0) {
    el.scrollTop = 1;
    return false;
  }

  const totalScroll = top + el.offsetHeight;
  if (totalScroll === el.scrollHeight) {
    el.scrollTop = top - 1;
    return false;
  }

  return true;
}

export function findLinkParent(el) {
  if (el.parentNode) {
    if (el.parentNode.tagName === 'A') {
      return el.parentNode;
    }

    return findLinkParent(el.parentNode);
  }
}

export function elementInOtherEl(el, className) {
  if (el.classList && el.classList.contains(className)) {
    return true;
  } else if (el.parentNode) {
    return elementInOtherEl(el.parentNode, className);
  }

  return false;
}

export function setMetaColor(color) {
  const metas = Array.prototype.slice.call(document.getElementsByTagName('meta'));

  const tag = metas.find(function(m) {
    return m.getAttribute('name') === 'theme-color';
  });

  tag.content = color;
}

export function setTitle(props={}) {
  const $title = document.getElementsByTagName('title')[0];
  if (props.title) {
    if ($title.textContent) {
      $title.textContent = props.title;
    } else if ($title.innerText) {
      $title.innerText = props.title;
    }
  }
}

export function logMissingHref($link, app) {
  const linkStringified = stringifyElement($link);

  const error = {
    message: 'A tag missing HREF',
    linkStringified,
  };

  const options = {
    redirect: false,
    replaceBody: false,
  };

  app.error(error, app.getState('ctx'), app, options);
}

export function refreshToken (app) {
  app.setState('refreshingToken', true);

  return new Promise(function(resolve, reject) {
    superagent
      .get('/oauth2/refresh')
      .end(function(err, res) {
        if (err) {
          reject(err);
        }

        const token = res.body;

        const now = new Date();
        const expires = new Date(token.tokenExpires);

        Object.assign(app.getState('ctx'), {
          token: token.token,
          tokenExpires: token.tokenExpires,
        });

        app.setState('refreshingToken', false);
        app.emit('token:refresh', token);

        window.setTimeout(function() {
          refreshToken(app).then(function() {
            Object.assign(app.getState('ctx'), {
              token: token.token,
              tokenExpires: token.tokenExpires,
            });

            app.setState('refreshingToken', false);
            app.emit('token:refresh', token);
          });
        }, (expires - now) * 0.9);
      });
  });
}

export function sendTimings(beginRender) {
  // Send the timings during the next cycle.
  if (window.bootstrap.actionName) {
    if (Math.random() < 0.1) { // 10% of requests
      const timings = Object.assign({
        actionName: `m.server.${window.bootstrap.actionName}`,
      }, getTimes());

      timings.mountTiming = (Date.now() - beginRender) / 1000;

      superagent
        .post('/timings')
        .timeout(constants.DEFAULT_API_TIMEOUT)
        .send({
          rum: timings,
        })
        .end(function() {});
    }
  }
}

export function onError(message, url, line, column) {
  const details = {
    userAgent: window.navigator.userAgent,
    message,
    url,
    line,
    column,
    requestUrl: window.location.toString(),
  };

  const hivemind = config.statsURL;

  errorLog(details, {
    hivemind,
    postErrorURL: config.postErrorURL,
  });
}

export function loadShimThenInitialize(initialize) {
  const $head = document.head || document.getElementsByTagName('head')[0];
  const shimScript = document.createElement('script');
  shimScript.type = 'text\/javascript';
  shimScript.onload = function() {
    initialize(false);
  };

  $head.appendChild(shimScript, document.currentScript);

  shimScript.src =`${window.bootstrap.config.assetPath}/js/es5-shims.js`;
}

export function onLoad(fn) {
  if (document.readyState !== 'complete' && document.readyState !== 'interactive') {
    window.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
  }
}

// this intermediary render is only here to protect us from rendering
// while the token is refreshing.
export function render (app, ...args) {
  return new Promise(function(resolve, reject) {
    if (app.getState('refreshingToken')) {

      ReactDOM.render(app.loadingpage(), app.config.mountPoint);

      app.on('token:refresh', function() {
        app.render(...args).then(resolve, reject);
      });
    } else {
      app.render(...args).then(resolve, reject);
    }
  });
}
