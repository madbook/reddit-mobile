import React from 'react';
import { LinkHijacker } from '@r/platform/components';

// A pass-through for node-platform's `LinkHijacker`
// that has the a regexp for catching all links that look like reddit links.
export default function(props) {
  const { onLinkClick, children } = props;
  return (
    <LinkHijacker
      onLinkClick={ onLinkClick }
      urlRegexp={ /^https?:\/\/(?:.+\.)?reddit\.com(.*)$/ }
    >
      { children }
    </LinkHijacker>
  );
}
