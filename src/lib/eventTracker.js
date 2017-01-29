import EventTracker from 'event-tracker';
import HmacSHA256 from 'crypto-js/hmac-sha256';
import { atob } from 'Base64';

import config from 'config';
import makeRequest from 'lib/makeRequest';
import { objectToHash } from 'lib/objectToHash';
import { DEFAULT_API_TIMEOUT } from 'app/constants';

function calculateHash(key, string) {
  return HmacSHA256(string, key).toString();
}

function post({url, data, query, headers, done}) {
  return makeRequest
    .post(url)
    .query(query)
    .set(headers)
    .timeout(DEFAULT_API_TIMEOUT)
    .send(data)
    .then(done);
}

function stubbedPost({ data }) {
  try {
    const eventData = JSON.parse(data);
    const eventTopics = eventData.map(e => e.event_topic).join(', ');
    console.info(`Tracking ${eventTopics} with data:`, eventData);
  } catch (e) {
    return;
  }
}

const trackers = {};

export function getEventTracker() {
  const {
    trackerKey,
    trackerClientSecret,
    trackerEndpoint,
    trackerClientAppName,
  } = config;

  const hash = objectToHash({
    trackerKey,
    trackerEndpoint,
    trackerClientSecret,
    trackerClientAppName,
  });

  let tracker = trackers[hash];

  if (!tracker) {
    const sendEvent = process.env.NODE_ENV === 'production' ? post : stubbedPost;
    const base64Secret = atob(trackerClientSecret);

    tracker = new EventTracker(
      trackerKey,
      base64Secret,
      sendEvent,
      trackerEndpoint,
      trackerClientAppName,
      calculateHash,
      {
        appendClientContext: true,
        bufferLength: 1,
      }
    );

    trackers[hash] = tracker;
  }

  return tracker;
}
