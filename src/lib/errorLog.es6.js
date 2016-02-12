import superagent from 'superagent';

function simpleUA(agent) {
  if (/server/i.test(agent)) { return 'server'; }

  // Googlebot does silly things like tell us it's iPhone, check first
  // see https://googlewebmastercentral.blogspot.com/2014/01/a-new-googlebot-user-agent-for-crawling.html
  if (/Googlebot/i.test(agent)) { return 'googlebot-js-client'; }

  if (/iPhone/i.test(agent) || /iPad/i.test(agent) || /iPod/i.test(agent)) {
    if (/CriOS/i.test(agent)) {
      return 'ios-chrome';
    }

    return 'ios-safari';
  }

  // Windows Phone 10 adds android to the UA, put this test first
  if (/Windows Phone/i.test(agent) || /Trident/i.test(agent)) { return 'windows-phone'; }

  if (/android/i.test(agent)) {
    if (/Version/i.test(agent)) {
      return 'android-stock-browser';
    }

    return 'android-chrome';
  }

  return 'unknownClient';
}

function formatLog(details) {
  if (!details) { return; }

  const {
    userAgent,
    message,
    url,
    line,
    column,
    requestUrl,
  } = details;

  const errorString = [userAgent || 'UNKNOWN'];

  errorString.push(message || 'NO MESSAGE');
  errorString.push(requestUrl || 'NO REQUEST URL');

  if (url) {
    errorString.push(url);

    if (line && typeof column !== 'undefined') {
      errorString.push(`${line}:${column}`);
    }
  }

  return errorString.join('|');
}

function errorLog(details, errorEndpoints, config={}) {
  const formattedLog = formatLog(details);
  console.log(formattedLog);

  if (config.debugLevel === 'info') {
    if (details.error && details.error.stack) {
      console.log(details.error.stack);
    }
  }

  // send to local log
  if (errorEndpoints.log) {
    sendErrorLog(formattedLog, errorEndpoints.log);
  }

  // send to statsd
  if (errorEndpoints.hivemind) {
    const ua = simpleUA(details.userAgent || '');
    hivemind(ua, errorEndpoints.hivemind);
  }

  // log to winston, soon
}

function sendErrorLog(error, endpoint) {
  superagent
    .post(endpoint)
    .send({ error })
    .then(()=>{});
}

function hivemind(ua, endpoint) {
  const data = {
    mwebError: {},
  };

  data.mwebError[ua] = 1;

  superagent
    .post(endpoint)
    .type('json')
    .send(data)
    .timeout(3000)
    .end(function() { });
}

export default errorLog;
