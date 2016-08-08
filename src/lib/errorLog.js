import { errors } from '@r/api-client';
import makeRequest from './makeRequest';

const { ResponseError } = errors;


const isAPIFailure = details => details.error instanceof ResponseError;

export default function (details, errorEndpoints, config={}) {
  // parse the stack for location details if we're passed
  // an Error or PromiseRejectionEvent
  const { error, rejection } = details;
  let parsedDetails = { ...details };
  if (error) {
    parsedDetails = { ...parsedDetails, ...parseError(error) };
  } else if (rejection) {
    parsedDetails = { ...parsedDetails, ...parseRejection(rejection) };
  }

  const formattedLog = formatLog(parsedDetails);
  console.log(formattedLog);

  if (config.debugLevel === 'info') {
    if (error && error.stack) {
      console.log(error.stack);
    } else if (rejection && rejection.reason && rejection.reason.stack) {
      console.log(rejection.reason.stack);
    }
  }

  // send to local log
  if (errorEndpoints.log) {
    sendErrorLog(formattedLog, errorEndpoints.log);
  }

  // send to statsd
  if (errorEndpoints.hivemind) {
    const ua = simpleUA(details.userAgent || '');
    hivemind(ua, errorEndpoints.hivemind, isAPIFailure(details));
  }
}

const parseError = error => {
  // error should be an instanceof Error
  if (error.stack) {
    const parts = textInParens(error.stack.split('\n')[1]).split(':');
    const len = parts.length;
    return {
      url: parts.slice(0, len - 2).join(':'),
      line: parts[len - 2],
      column: parts[len - 1],
      message: `Error: ${error.message}`,
    };
  }

  return {
    message: `Error: ${error.message}`,
  };
};

const parseRejection = rejection => {
  // rejection should be an instanceof PromiseRejectionEvent
  if (rejection.reason && rejection.reason.stack) {
    const parts = textInParens(rejection.reason.stack.split('\n')[1]).split(':');
    const len = parts.length;
    return {
      url: parts.slice(0, len - 2).join(':'),
      line: parts[len - 2],
      column: parts[len - 1],
      message: `Rejection: ${rejection.reason}`,
    };
  }

  return {
    message: `Rejection: ${rejection.reason}`,
  };
};

const textInParens = string => {
  const match = string.match(/.*\((.*)\).*/);
  if (match) {
    return match[1];
  }

  return '';
};

function formatLog(details) {
  if (!details) { return; }

  const {
    userAgent,
    message,
    reduxInfo,
    url,
    line,
    column,
    requestUrl,
  } = details;

  const errorString = [userAgent || 'UNKNOWN'];

  if (isAPIFailure(details)) {
    errorString.push('API REQUEST FAILURE');
  }

  errorString.push(message || 'NO MESSAGE');
  errorString.push(requestUrl || 'NO REQUEST URL');

  if (reduxInfo) {
    errorString.push(reduxInfo);
  }

  if (url) {
    errorString.push(url);

    if (line && typeof column !== 'undefined') {
      errorString.push(`${line}:${column}`);
    }
  }

  return errorString.join(' | ');
}

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
