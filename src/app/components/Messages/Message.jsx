import './Message.less';
import React from 'react';
import { Anchor } from '@r/platform/components';

import { short } from 'lib/formatDifference';

const T = React.PropTypes;

export default function MessagesMessage(props) {
  const { message } = props;

  return (
    <div className='MessagesMessage'>
      <div className='MessagesMessage__header'>
        <div className='MessagesMessage__title'>
          { message.subject }
        </div>
        <div className='MessagesMessage__subtitle'>
          { `${ message.author } \u2022 ${ short(message.createdUTC) }` }
        </div>
        <Anchor
          className='MessagesMessage__link icon icon-nav-arrowforward'
          href={ `/messages/message/${ message.id }` }
        />
      </div>
      <div className='MessagesMessage__body'
        dangerouslySetInnerHTML={ { __html: message.bodyHTML } }
      />
    </div>
  );
}

MessagesMessage.propTypes = {
  message: T.object.isRequired,
};
