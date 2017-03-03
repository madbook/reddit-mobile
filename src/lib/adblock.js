import { isHidden } from 'lib/dom';
import { ADBLOCK_TEST_ID } from 'app/constants';

export const hasAdblock = () => {
  // Now that this is used in events tracking, add a check to ensure we're
  // executing on the client
  if (process.env.ENV !== 'client') {
    return false;
  }

  const adblockTester = document.getElementById(ADBLOCK_TEST_ID);
  // If the div has been removed, they have adblock
  if (!adblockTester) { return true; }

  const rect = adblockTester.getBoundingClientRect();
  if (!rect || !rect.height || !rect.width) {
    return true;
  }

  return isHidden(adblockTester);
};
