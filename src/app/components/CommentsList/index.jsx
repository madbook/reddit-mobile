import './styles.less';

import React from 'react';

import map from 'lodash/map';

import Comment from 'app/components/Comment';

export default (props) => {
  const { commentRecords, op, nestingLevel, votingDisabled } = props;

  return (
    <div className={ `CommentsList ${props.className || ''}` }>

      { map(commentRecords, record => {
        return (
          <Comment
            key={ `comment-id-${record.uuid}` }
            commentId={ record.uuid }
            op={ op }
            nestingLevel={ nestingLevel }
            votingDisabled={ votingDisabled }
          />
        );
      }) }
    </div>
  );
};
