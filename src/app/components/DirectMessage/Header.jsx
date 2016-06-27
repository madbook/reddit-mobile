import './Header.less';
import React from 'react';
import { BackAnchor } from '@r/platform/components';

export default function DirectMessageHeader() {
  return (
    <div className='DirectMessageHeader'>
      <BackAnchor
        className='DirectMessageHeader__back icon icon-nav-close'
        href={ BackAnchor.AUTO_ROUTE }
        fallbackHref='/message/messages'
      />
      <div className='DirectMessageHeader__title'>Direct Message</div>
    </div>
  );
}
