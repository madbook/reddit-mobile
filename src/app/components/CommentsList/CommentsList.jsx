import './CommentsList.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { map } from 'lodash/collection';

import Comment from '../Comment/Comment';

export const CommentsList = (props) => {
  const { comments, parentComment, postCreated, user, op, nestingLevel } = props;

  return (
    <div className='CommentsList'>
      { map(comments, (comment) => {
        if (comment.bodyHTML !== undefined) {
          return (
            <Comment
              key={ `comment-id-${comment.name}` }
              comment={ comment }
              parentComment={ parentComment }
              postCreated={ postCreated }
              user={ user }
              op={ op }
              nestingLevel={ nestingLevel }
            />
          );
        }
      }) }
    </div>
  );
};

const commentsListSelector = createSelector(
  (state, props) => props,
  (state, props) => props.comments,
  (state) => state.comments,
  (props, commentRecords, commentsStore) => {
    const comments = map(commentRecords, r => commentsStore[r.uuid]);
    return { ...props, comments };
  }
);

export default connect(commentsListSelector)(CommentsList);
