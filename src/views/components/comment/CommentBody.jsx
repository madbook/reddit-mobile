import React from 'react';

const T = React.PropTypes;

function CommentBody(props) {
  return (
    <div className='CommentBody'>
      <div
        className='CommentBody__content'
        dangerouslySetInnerHTML={ { __html: props.content } }
      />
    </div>
  );
}

CommentBody.propTypes = {
  content: T.string.isRequired,
};

export default CommentBody;
