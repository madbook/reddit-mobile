import './styles.less';
import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { POST, COMMENT } from 'apiClient/models/thingTypes';

import PaginationButtons from 'app/components/PaginationButtons';
import Post from 'app/components/Post';
import CommentPreview from 'app/components/CommentPreview';
import Loading from 'app/components/Loading';

import commentDispatchers from 'app/components/Comment/dispatchers';

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
  const { loading, records } = props;

  if (loading) {
    return <Loading />;
  }

  const renderRecord = record =>
    renderRecordWithProps(props, record);

  return (
    <div className='PostAndCommentList'>
      <div>
        { records.map(renderRecord) }
        { records.length > 0 && <PaginationButtons records={ records } /> }
      </div>
    </div>
  );
}

const renderRecordWithProps = (props, record) => {
  const { user, comments, commentDispatchers,
          thingProps, thingsBeingEdited, replyingList } = props;
  const { uuid, type } = record;

  switch (type) {
    case POST: {
      return <Post postId={ uuid } key={ `post-id-${uuid}` } { ...thingProps } />;
    }
    case COMMENT: {
      const editObject = thingsBeingEdited[uuid];
      return (
        <CommentPreview
          comment={ comments[record.uuid] }
          key={ `comment-id-${uuid}` }
          { ...thingProps }
          commentDispatchers={ commentDispatchers }
          user={ user }
          commentReplying={ !!replyingList[uuid] }
          editing={ !!editObject }
          editPending={ !!(editObject && editObject.pending) }
        />
      );
    }
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
  state => state.user,
  state => state.posts,
  state => state.comments.data,
  (_, props) => props.requestLocation,
  (state, props) => state[props.requestLocation][props.requestId],
  state => state.editingText,
  state => state.replying,
  (user, posts, comments, requestLocation, request, thingsBeingEdited, replyingList) => {
    const filter = getThingFilter(posts, comments, requestLocation);
    return {
      user,
      request,
      comments,
      thingsBeingEdited,
      replyingList,
      loading: !request || request.loading,
      records: request ? request.results.filter(filter) : [],
    };
  },
);

const dispatchToProps = (dispatch) => ({
  commentDispatchers: commentDispatchers(dispatch),
});

export default connect(mapStateToProps, dispatchToProps)(PostAndCommentList);
