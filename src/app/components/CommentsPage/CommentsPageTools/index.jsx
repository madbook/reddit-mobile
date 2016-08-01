import './styles.less';

import React from 'react';
import { Anchor } from '@r/platform/components';
import { urlFromPage } from '@r/platform/pageUtils';

import CommentReplyForm from 'app/components/Comment/CommentReplyForm';
import SortSelector from 'app/components/SortSelector';
import { SORTS } from 'app/sortValues';


export default ({ replying, currentPage, id, onSortChange }) => {
  const { queryParams: { sort } } = currentPage;

  const replyHref = urlFromPage(currentPage, {
    queryParams: {
      sort,
      commentReply: id,
    },
  });

  return (
    <div className='CommentsPage__tools'>
      <div className='CommentsPage__tools_toolbar'>
        <SortSelector
          className='CommentsPage__tools_sortSelector'
          id='comment-sort-selector'
          title='Sort comments by:'
          sortValue={ sort || SORTS.CONFIDENCE }
          sortOptions={ [
            SORTS.CONFIDENCE,
            SORTS.TOP,
            SORTS.NEW,
            SORTS.CONTROVERSIAL,
            SORTS.QA,
          ] }
          onSortChange={ onSortChange }
        />

        <Anchor className='Button m-linkbutton' href={ replyHref }>
          Write a comment
        </Anchor>
      </div>
      { !replying ? null :
        <div className='CommentsPage__replyForm'>
          <CommentReplyForm
            currentPage={ currentPage }
            parentId={ id }
          />
        </div>
      }
    </div>
  );
};
