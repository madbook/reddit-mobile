'use strict';

// Normalize DNT across browser vendors
// spec: http://www.w3.org/2011/tracking-protection/drafts/tracking-dnt.html#widl-Navigator-doNotTrack

const RE_IE_VERSION = /(?:\b(?:MS)?IE\s+|\bTrident\/7\.0;.*\s+rv:)(\d+(?:\.?\d+)?)/i;

if (global.navigator) {
  const uaMatches = global.navigator.userAgent.match(RE_IE_VERSION);
  const ieVersion = uaMatches && uaMatches[1] && parseFloat(uaMatches[1]);
  const doNotTrack = global.navigator.doNotTrack ||
    global.doNotTrack ||
    global.navigator.msDoNotTrack;

  
  const dnt = doNotTrack == null ?
    null : /^(yes|1)$/i.test(doNotTrack) && ieVersion !== 10 ? 
      '1' : '0';

  try {
    // DNT is readonly in browsers that support getters
    Object.defineProperty(global.navigator, 'doNotTrack', {
      get: function() {
        return dnt;
      },
    });
  } catch (e) {
    global.navigator.doNotTrack = dnt;
  }
}
