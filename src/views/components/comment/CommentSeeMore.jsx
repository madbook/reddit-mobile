import React from 'react';
import fill from 'lodash/array/fill';

const T = React.PropTypes;

function getLoadingMsg(props) {
  if (props.isLoading) { return 'Loading...'; }
  return `More comments (${props.count})`;
}

function renderDots(count) {
  const content = fill(Array(count), '•').join(' ');
  
  return <div className='CommentSeeMore__dots'>{ content }</div>;
}

function CommentSeeMore(props) {
  return (
    <div className='CommentSeeMore' onClick={ props.onLoadMore }>
      { props.dots ? renderDots(props.dots) : null }
      <div className='CommentSeeMore__caron icon-caron-circled' />
      <div className='CommentSeeMore__msg'>{ getLoadingMsg(props) }</div>
    </div>
  );
}

CommentSeeMore.propTypes = {
  count: T.number.isRequired,
  onLoadMore: T.func.isRequired,
  isLoading: T.bool,
  dots: T.number,
};

CommentSeeMore.defaultProps = {
  isLoading: false,
  dots: 0,
};

export default CommentSeeMore;
