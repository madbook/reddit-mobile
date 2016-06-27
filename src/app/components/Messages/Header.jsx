import './Header.less';
import React from 'react';
// import { Anchor } from '@r/platform/components';

export default function MessagesHeader() {
  return (
    <div className='MessageHeader'>
      <div className='MessageHeader__title'>Inbox</div>
      {/*Don't allow access to messager composition until that feature is ready
      <Anchor
        className='MessageHeader__compose icon icon-message'
        href='/message/compose'
      />*/}
    </div>
  );
}
