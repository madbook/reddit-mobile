import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { map } from 'lodash/collection';

export class CommentsList extends React.Component {
  render() {
    const { commentsPage, comments } = this.props;

    return (
      <div className='CommentsList'>
        { !commentsPage || commentsPage.loading
          ? this.renderLoading()
          : this.renderCommentsList(comments) }
      </div>
    );
  }

  renderLoading() {
    return <div className='CommentsList__loading' />;
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
          />
        </div>
      );
    });
  }
}

const listSelector = createSelector(
  (state, props) => props.commentsPageId,
  (state, props) => state.commentsPages[props.commentsPageId],
  (state, props) => state.comments,
  (commentsPageId, commentsPage, commentsStore) => {
    const comments = (!commentsPage || commentsPage.loading)
      ? []
      : map(commentsPage.results, (r => commentsStore[r.uuid]));

    return { commentsPageId, commentsPage, comments };
  },
);

export default connect(listSelector)(CommentsList);
