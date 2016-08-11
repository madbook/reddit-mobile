import React from 'react';
import fill from 'lodash/array/fill';

const T = React.PropTypes;

const LOADING_MSG = 'Continue this thread';

function renderDots(count) {
  const content = fill(Array(count), '•').join(' ');

  return <div className='CommentContinueThisThread__dots'>{ content }</div>;
}

function CommentContinueThisThread(props) {
  return (
    <a href={ props.dest } className='CommentContinueThisThread'>
      { props.dots ? renderDots(props.dots) : null }
      <div className='CommentContinueThisThread__caron icon-caron-circled' />
    <div className='CommentContinueThisThread__msg'>{ LOADING_MSG }</div>
    </a>
  );
}

CommentContinueThisThread.propTypes = {
  dest: T.string.isRequired,
  dots: T.number,
};

CommentContinueThisThread.defaultProps = {
  dots: 0,
};

export default CommentContinueThisThread;
