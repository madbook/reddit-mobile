import './styles.less';
import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import Ad from 'app/components/Ad';
import PaginationButtons from 'app/components/PaginationButtons';
import Post from 'app/components/Post';
import Loading from 'app/components/Loading';
import adLocationForPostRecords from 'lib/adLocationForPostRecords';

import map from 'lodash/map';

const T = React.PropTypes;

export const PostsList = props => {
  const { loading, postRecords, nextUrl, prevUrl, shouldPage } = props;
  const shouldRenderPagination = !loading && shouldPage && postRecords.length;

  if (loading) {
    return <Loading />;
  }

  return (
    <div className='PostsList PostAndCommentList'>
      { renderPostsList(props) }
      { shouldRenderPagination ? renderPagination(postRecords, nextUrl, prevUrl) : null }
    </div>
  );
};

PostsList.propTypes = {
  loading: T.bool.isRequired,
  postRecords: T.array.isRequired,
  nextUrl: T.string,
  prevUrl: T.string,
  shouldPage: T.bool,
  forceCompact: T.bool,
  subredditIsNSFW: T.bool,
};

PostsList.defaultProps = {
  nextUrl: '',
  prevUrl: '',
  forceCompact: false,
  subredditIsNSFW: false,
  shouldPage: true,
};

const renderPostsList = props => {
  const { postRecords, ad, adId, forceCompact, subredditIsNSFW } = props;
  const records = ad ? recordsWithAd(postRecords, ad) : postRecords;

  return map(records, postRecord => {
    const postId = postRecord.uuid;

    const postProps = {
      postId,
      forceCompact,
      subredditIsNSFW,
      key: `post-id-${postId}`,
    };

    if (ad && postId === ad.uuid) {
      // Ad wants the adId for tracking the ad impression
      return <Ad postProps={ postProps } adId={ adId } />;
    }

    return <Post { ...postProps } />;
  });
};

const recordsWithAd = (postRecords, ad) => {
  const adLocation = adLocationForPostRecords(postRecords);
  const newRecords = postRecords.slice(0);
  newRecords.splice(adLocation, 0, ad);
  return newRecords;
};

const renderPagination = (postRecords, nextUrl, prevUrl) => (
  <PaginationButtons
    preventUrlCreation={ !!(nextUrl || prevUrl) }
    nextUrl={ nextUrl }
    prevUrl={ prevUrl }
    records={ postRecords }
  />
);

const isAdLoaded = adRequest => (
  adRequest && !adRequest.pending && adRequest.ad
);

const listSelector = createSelector(
  (state, props) => state.postsLists[props.postsListId],
  state => state.posts,
  (state, props) => {
    const postsList = state.postsLists[props.postsListId];
    if (!postsList) { return null; }
    return state.adRequests[postsList.adId];
  },
  (_, props) => props.nextUrl,
  (_, props) => props.prevUrl,
  (postsList, posts, adRequest, nextUrl, prevUrl) => ({
    loading: !!postsList && postsList.loading,
    postRecords: postsList ? postsList.results.filter(p => !posts[p.uuid].hidden) : [],
    ad: isAdLoaded(adRequest) ? adRequest.ad : '',
    adId: isAdLoaded(adRequest) ? adRequest.adId : '',
    prevUrl,
    nextUrl,
  }),
);

export default connect(listSelector)(PostsList);
