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

PostAndCommentList.propTypes = {
  loading: T.bool.isRequired,
  records: T.array.isRequired,
  thingProps: T.object,
};

PostAndCommentList.defaultProps = {
  thingProps: {},
};

export function PostAndCommentList(props) {
  const { loading, records, shouldPage, thingProps } = props;

  if (loading) {
    return <Loading />;
  }

  return (
    <div className='PostAndCommentList'>
      <PostsCommentsAndPagination
        records={ records }
        thingProps={ thingProps }
        shouldPage={ shouldPage }
      />
    </div>
  );
}

const PostsCommentsAndPagination = props => {
  const { records, thingProps } = props;
  const renderRecord = record => renderRecordWithProps(thingProps, record);

  return (
    <div>
      { records.map(renderRecord) }
      { records.length > 0 && <PaginationButtons records={ records } /> }
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

const getThingFilter = (posts, comments, requestLocation) => {
  if (requestLocation === 'activitiesRequests') {
    return thing => {
      const collection = thing.type === 'comment' ? comments : posts;
      return collection[thing.uuid];
    };
  }

  return thing => {
    const collection = thing.type === 'comment' ? comments : posts;
    const key = requestLocation === 'savedRequests' ? 'saved' : 'hidden';
    return collection[thing.uuid][key];
  };
};

const mapStateToProps = createSelector(
  state => state.posts,
  state => state.comments,
  (_, props) => props.requestLocation,
  (state, props) => state[props.requestLocation][props.requestId],
  (posts, comments, requestLocation, request) => {
    const filter = getThingFilter(posts, comments, requestLocation);
    return {
      request,
      loading: !request || request.loading,
      records: request ? request.results.filter(filter) : [],
    };
  },
);

export default connect(mapStateToProps)(PostAndCommentList);
