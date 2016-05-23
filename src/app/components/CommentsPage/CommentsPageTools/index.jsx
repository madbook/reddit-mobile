import './styles.less';

import React from 'react';
import { Anchor } from '@r/platform/components';
import { urlFromPage } from '@r/platform/pageUtils';

import CommentReplyForm from 'app/components/Comment/CommentReplyForm';

export default ({ replying, currentPage, id }) => {
  const replyHref = urlFromPage(currentPage, { queryParams: { commentReply: id } });

  return (
    <div className='CommentsPage__tools'>
      <div className='CommentsPage__tools_toolbar'>
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
