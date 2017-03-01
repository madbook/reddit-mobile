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
    .then(done)
    .catch(done);
}

function stubbedPost({ data, done }) {
  try {
    const eventData = JSON.parse(data);
    const eventTopics = eventData.map(e => e.event_topic).join(', ');
    console.info(`Tracking ${eventTopics} with data:`, eventData);
    done();
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

    /* 
     * (v.artem.tkachenko@reddit.com) 
     * Method "Send" (from the external "event-tracker" 
     * lib. https://github.com/reddit/event-tracker) 
     * is executing without "Done" callback in usual mode, and
     * there is no way to fire Resolve/Reject for Promise
     */
    patchEventTracker(tracker);
  }
  return tracker;
}

/*
 * Patch for EventTracker libery. Add Done callback to 
 * current 'Send' method of external "event-tracker" lib
 * (https://github.com/reddit/event-tracker).
 * 
 * instance: tracer (new instance of EventTracker)
 */ 
function patchEventTracker(instance) {
  /*
   * @TODO: we should replace current
   * external 'Send' method with this one.
   */
  const updatedSend = function(done) {
    if (this.buffer.length) {
      const data = JSON.stringify(this.buffer);
      const hash = this.calculateHash(this.clientSecret, data);
      const headers = {'Content-Type': 'text/plain'};

      this.postData({
        url: this.eventsUrl,
        data: data,
        headers: headers,
        query: {
          key: this.clientKey,
          mac: hash,
        },
        done: ((this.done || done) || function() {}), 
      });
      this.buffer = [];
    }
  };

  instance.replaceToNewSend = function() {
    if (!this.done) {
      this.send = updatedSend;
    }
    return this;
  };

  instance.addDoneToNewSend = function(done) {
    this.done = done;
    return this;
  };
}
