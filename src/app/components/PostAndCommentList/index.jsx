import './styles.less';
import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { models } from '@r/api-client';
const { POST, COMMENT } = models.ModelTypes;

import PaginationButtons from 'app/components/PaginationButtons';
import Post from 'app/components/Post';
import CommentPreview from 'app/components/CommentPreview';
import Loading from 'app/components/Loading';

const T = React.PropTypes;

const mapStateToProps = createSelector(
  (state, props) => state[props.requestLocation][props.requestId],
  (request) => ({
    request,
    loading: !request || request.loading,
    records: request ? request.results : [],
  }),
);

export const PostAndCommentList = props => {
  const { loading, records, shouldPage, thingProps } = props;

  return (
    <div className='PostAndCommentList'>
      { loading ? <Loading /> :
        <PostsCommentsAndPagination
          records={ records }
          thingProps={ thingProps }
          shouldPage={ shouldPage }
        />
      }
    </div>
  );
};

PostAndCommentList.propTypes = {
  loading: T.bool.isRequired,
  records: T.array.isRequired,
  thingProps: T.object,
};

PostAndCommentList.defaultProps = {
  thingProps: {},
};

export default connect(mapStateToProps)(PostAndCommentList);

const PostsCommentsAndPagination = props => {
  const { records, thingProps } = props;
  const renderRecord = record => renderRecordWithProps(thingProps, record);

  return (
    <div>
      { records.map(renderRecord) }
      { records.length && <PaginationButtons records={ records } /> }
    </div>
  );
};

const renderRecordWithProps = (thingProps, record) => {
  const { uuid, type } = record;

  switch (type) {
    case POST:
      return <Post postId={ uuid } key={ `post-id-${uuid}` } { ...thingProps } />;

    case COMMENT:
      return <CommentPreview commentId={ uuid } key={ `comment-id-${uuid}` } { ...thingProps } />;

    default: return null;
  }
};
