import { errors } from '@r/api-client';
import makeRequest from './makeRequest';

const { ResponseError } = errors;

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
    error,
  } = details;

  const errorString = [userAgent || 'UNKNOWN'];

  if (error instanceof ResponseError) {
    errorString.push('API REQUEST FAILURE');
  }

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

  const isAPIFailure = details.error && details.error instanceof ResponseError;

  // send to statsd
  if (errorEndpoints.hivemind) {
    const ua = simpleUA(details.userAgent || '');
    hivemind(ua, errorEndpoints.hivemind, isAPIFailure);
  }

  // log to winston, soon
}

function sendErrorLog(error, endpoint) {
  makeRequest
    .post(endpoint)
    .send({ error })
    .then();
}

function hivemind(ua, endpoint, isAPIFailure) {
  const segment = isAPIFailure ? 'mwebAPIError' : 'mwebError';
  const data = {
    [segment]: {},
  };

  data[segment][ua] = 1;

  makeRequest
    .post(endpoint)
    .type('json')
    .send(data)
    .timeout(3000)
    .then();
}

export default errorLog;
