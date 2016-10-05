import './Comment.less';
import React from 'react';
import { Anchor } from '@r/platform/components';

import { short } from 'lib/formatDifference';
import RedditLinkHijacker from 'app/components/RedditLinkHijacker';

const T = React.PropTypes;

const SEPARATOR = ' \u2022 ';

export default function MessagesComment(props) {
  const { comment } = props;

  return (
    <div className='MessagesComment'>
      <Anchor
        className='MessagesComment__title'
        href={ comment.cleanPermalink }
      >
        { comment.linkTitle }
      </Anchor>
      <div className='MessagesComment__metaData'>
        <Anchor
          className='MessagesComment__metaDataLink'
          href={ `/user/${comment.author}` }
        >
          { comment.author }
        </Anchor>
        { SEPARATOR }
        <Anchor
          className='MessagesComment__metaDataLink'
          href={ `/r/${comment.subreddit}` }
        >
          { comment.subreddit }
        </Anchor>
        { SEPARATOR }
        { short(comment.createdUTC) }
      </div>
      <RedditLinkHijacker>
        <div
          className='MessagesComment__body'
          dangerouslySetInnerHTML={ { __html: comment.bodyHTML } }
        />
      </RedditLinkHijacker>
    </div>
  );
}

MessagesComment.propTypes = {
  comment: T.object.isRequired,
};
