import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { Anchor } from '@r/platform/components';

import Comment from '../Comment';

export default connect(createSelector(
  (state, props) => state.comments[props.commentId],
  (comment) => ({ comment }),
))(CommentPreview);

export function CommentPreview(props) {
  const { commentId, comment, userActivityPage } = props;

  return (
    <div className={ `CommentPreview ${userActivityPage ? 'in-list' : 'separated'}` } >
      <div className='CommentPreview__wrapper'>
        <Anchor className='CommentPreview__permalink' href={ comment.cleanPermalink }>
          { comment.linkTitle }
        </Anchor>
        <Comment
          commentId={ commentId }
          userActivityPage={ userActivityPage }
          preview={ true }
        />
      </div>
    </div>
  );
}
