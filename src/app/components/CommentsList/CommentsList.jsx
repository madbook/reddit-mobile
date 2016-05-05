import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { map } from 'lodash/collection';

export class CommentsList extends React.Component {
  render() {
    const { comments } = this.props;

    return (
      <div className='CommentsList'>
        { this.renderCommentsList(comments) }
      </div>
    );
  }

  renderCommentsList(comments) {
    return map(comments, comment => {
      return (
        <div className='Comment' key={ `comment-${comment.name}` }>
          { comment.author || 'load more' }
          <div
            dangerouslySetInnerHTML={
              { __html: comment.bodyHTML || '<div>so many more comments</div>' }
            }
          />ch
        </div>
      );
    });
  }
}

const listSelector = createSelector(
  (state, props) => props.comments,
  (state, props) => state.comments,
  (commentRecords, commentsStore) => {
    const comments = map(commentRecords, r => commentsStore[r.uuid]);
    return { comments };
  },
);

export default connect(listSelector)(CommentsList);
