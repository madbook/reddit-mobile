import './Message.less';
import React from 'react';
import { Anchor } from '@r/platform/components';

import { short } from 'lib/formatDifference';
import RedditLinkHijacker from 'app/components/RedditLinkHijacker';

const T = React.PropTypes;

const SEPARATOR = '\u2022';

export default function MessagesMessage(props) {
  const { message } = props;

  return (
    <div className='MessagesMessage'>
      <div className='MessagesMessage__header'>
        <div className='MessagesMessage__title'>
          <Anchor
            className='MessagesMessage__titleLink'
            href={ `/message/messages/${ message.id }` }
          >
            { message.subject }
          </Anchor>
        </div>
        <div className='MessagesMessage__subtitle'>
          <Anchor
            className='MessagesMessage__authorLink'
            href={ `/user/${ message.author }` }
          >
            { message.author }
          </Anchor>
          { SEPARATOR }
          { short(message.createdUTC) }
        </div>
        <Anchor
          className='MessagesMessage__link icon icon-nav-arrowforward'
          href={ `/message/messages/${ message.id }` }
        />
      </div>
      <RedditLinkHijacker>
        <div
          className='MessagesMessage__body'
          dangerouslySetInnerHTML={ { __html: message.bodyHTML } }
        />
      </RedditLinkHijacker>
    </div>
  );
}

MessagesMessage.propTypes = {
  message: T.object.isRequired,
};
