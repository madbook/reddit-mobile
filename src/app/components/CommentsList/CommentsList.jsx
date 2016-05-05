import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { map } from 'lodash/collection';

import Comment from '../Comment/Comment';

export default class CommentsList extends React.Component {
  render() {
    const { comments } = this.props;

    return (
      <div className='CommentsList'>
        { this.renderCommentsList(comments) }
      </div>
    );
  }

  renderCommentsList(comments) {
    const { parentComment, postCreated, user, op, nestingLevel } = this.props;

    return map(comments, commentRecord => {
      return (
        <Comment
          key={ `comment-id-${commentRecord.uuid}` }
          commentId={ commentRecord.uuid }
          parentComment={ parentComment }
          postCreated={ postCreated }
          user={ user }
          op={ op}
          nestingLevel={ nestingLevel }
        />
      );
    });
  }
}
