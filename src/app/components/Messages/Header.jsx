import './Header.less';
import React from 'react';
import { Anchor } from '@r/platform/components';

export default function MessagesHeader() {
  return (
    <div className='MessageHeader'>
      <div className='MessageHeader__title'>Inbox</div>
      <Anchor
        className='MessageHeader__compose icon icon-message'
        href='/message/compose'
      />
    </div>
  );
}
