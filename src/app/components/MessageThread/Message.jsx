import './Message.less';
import React from 'react';

import { Anchor } from 'platform/components';
import { short } from 'lib/formatDifference';
import RedditLinkHijacker from 'app/components/RedditLinkHijacker';

const T = React.PropTypes;

const SEPARATOR = ' \u2022 ';

export default function MessageThreadMessage(props) {
  const { message } = props;

  return (
    <div className='MessageThreadMessage'>
      <div className='MessageThreadMessage__title'>
        <Anchor
          className='MessageThreadMessage__authorLink'
          href={ `/user/${ message.author }` }
        >
          { message.author }
        </Anchor>
        { SEPARATOR }
        { short(message.createdUTC) }
      </div>
      <RedditLinkHijacker>
        <div
          className='MessageThreadMessage__body'
          dangerouslySetInnerHTML={ { __html: message.bodyHTML } }
        />
      </RedditLinkHijacker>
    </div>
  );
}

MessageThreadMessage.propTypes = {
  message: T.object.isRequired,
};
