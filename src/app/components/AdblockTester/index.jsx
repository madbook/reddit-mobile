import React from 'react';
import { ADBLOCK_TEST_ID } from 'app/constants';
import config from 'config';

const { adblockTestClassName } = config;

// Renders a component, hidden offscreen, used to detect if adblock is
// enabled. If it's enabled, the div will either be removed entirely from
// the dom, or hidden via css or style modifications. The checks
// for being hidden currently live in `lib/eventUtils`

export default function AdblockTester() {
  return (
    <div
      id={ ADBLOCK_TEST_ID }
      className={ adblockTestClassName }
      style={ {
        height: 1,
        width: 1,
        position: 'absolute',
        left: '-1000%',
      } }
    />
  );
}
