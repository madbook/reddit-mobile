import './styles.less';

import React from 'react';
import { Anchor } from '@r/platform/components';

import CommentReplyForm from 'app/components/Comment/CommentReplyForm';
import SortSelector from 'app/components/SortSelector';
import { SORTS } from 'app/sortValues';

const renderThreadNotice = (post, hasSingleComment) => {
  const { archived, locked, subredditDetail } = post;

  let message;
  if (hasSingleComment) {
    message = (
      <div>
        <span>You are viewing a single comment's thread.</span>
        <Anchor href={ post.cleanPermalink }>
          View the rest of the comments
        </Anchor>
      </div>
    );
  } else if (archived) {
    message = <div>Post is archived</div>;
  } else if (locked) {
    message = <div>Comments are locked</div>;
  } else if (subredditDetail && subredditDetail.user_is_banned) {
    message = <div>You are banned from commenting in this community for now</div>;
  }

  if (message) {
    return (
      <div className='alert-warning'>
        { message }
      </div>
    );
  }
};


export default props => {
  const {
    isReplying,
    post,
    hasSingleComment,
    preferences,
    id,
    onSortChange,
    onToggleReply,
    currentPage: { queryParams: { sort } },
  } = props;

  const archived = post ? post.archived : false;
  const locked = post ? post.locked : false;
  const commentingDisabled = archived || locked;
  const suggestedSort = !preferences.ignoreSuggestedSort && post.suggestedSort;

  return (
    <div className='CommentsPage__tools'>
      <div className='CommentsPage__tools_toolbar'>
        <SortSelector
          className='CommentsPage__tools_sortSelector'
          id='comment-sort-selector'
          title='Sort comments by:'
          sortValue={ sort || suggestedSort || preferences.defaultCommentSort }
          sortOptions={ [
            SORTS.CONFIDENCE,
            SORTS.TOP,
            SORTS.NEW,
            SORTS.CONTROVERSIAL,
            SORTS.QA,
          ] }
          onSortChange={ onSortChange }
        />
        { commentingDisabled ? null :
          <span className='Button m-linkbutton' onClick={ onToggleReply }>
            Write a comment
          </span>
        }
      </div>
      { post ? renderThreadNotice(post, hasSingleComment) : null }
      { !isReplying ? null :
        <div className='CommentsPage__replyForm'>
          <CommentReplyForm
            parentId={ id }
            onToggleReply={ onToggleReply }
          />
        </div>
      }
    </div>
  );
};
