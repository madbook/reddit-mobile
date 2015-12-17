'use strict';

/* Normalize DNT across browser vendors */

const RE_IE_VERSION = /(?:\b(?:MS)?IE\s+|\bTrident\/7\.0;.*\s+rv:)(\d+(?:\.?\d+)?)/i;

if (global.navigator) {
  const uaMatches = global.navigator.userAgent.match(RE_IE_VERSION);
  const ieVersion = uaMatches && uaMatches[1] && parseFloat(uaMatches[1]);
  const doNotTrack = global.navigator.doNotTrack ||
    global.doNotTrack ||
    global.navigator.msDoNotTrack;

  global.DO_NOT_TRACK = /^(yes|1)$/i.test(doNotTrack) && ieVersion !== 10;
}
