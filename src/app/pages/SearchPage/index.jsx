import './styles.less';

import React from 'react';

import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { Anchor } from '@r/platform/components';


import SearchPageHandler from 'app/router/handlers/SearchPage';
import { paramsToSearchRequestId } from 'app/models/SearchRequest';

import CommunityRow from 'app/components/CommunityRow';
import PaginationButtons from 'app/components/PaginationButtons';
import Loading from 'app/components/Loading';
import { PostsList } from 'app/components/PostsList';
// ^^ we're not using the connected version intentionally, for now

const searchLoading = () => (
  <div className='SearchPage__loading'>
    <Loading />
  </div>
);

const noResultsMsg = query => (
  <div className='SearchPage__noResults'>
    <div className='SearchPage__noResultsMsg'>Sorry, we couldn't find any results for</div>
    <div className='SearchPage__noresultsQuery'>'{ query }'</div>
  </div>
);

const helpfulMsg = () => (
  <div className='SearchPage__helpfulMsg'>
    Tap the <div className='SearchPage__helpfulIcon icon icon-search blue' /> icon to get started.
  </div>
);

const communityResults = (subredditRecords) => (
  <div className='SearchPage__communitiesResults'>
    { subredditRecords.map(record => (
      <div className='SearchPage__community' key={ record.uuid }>
        <CommunityRow subredditName={ record.uuid } />
      </div>
    )) }
  </div>
);

const communitySeeMore = pageProps => {
  const { urlParams, queryParams } = pageProps;
  const url = SearchPageHandler.buildURL(urlParams, {
    ...queryParams,
    type: 'sr',
  });

  return (
    <Anchor
      className='SearchPage__communitiesHeaderMore'
      href={ url }
    >
      View More
      <div className='SearchPage__communitiesHeaderMoreIcon icon icon-nav-arrowforward'/>
    </Anchor>
  );
};

const communitiesHeader = (renderingPosts, pageProps) => (
  <div className='SearchPage__communitiesHeader'>
    <div className='SearchPage__communitiesHeaderTitle'>Communities</div>
    { renderingPosts ? communitySeeMore(pageProps) : null }
  </div>
);


const shouldPaginateCommunities = (pageData, subredditRecords, renderingPosts) => {
  return !renderingPosts && (subredditRecords.length >= 25 ||
      (subredditRecords.length && pageData.queryParams.page > 0));
};

const communitiesPaginationButtons = (pageData, subredditRecords) => {
  const { urlParams, queryParams } = pageData;
  const page = parseInt(queryParams.page || 0);

  let prevUrl;
  if (page > 0 && subredditRecords.length) {
    prevUrl = SearchPageHandler.buildURL(urlParams, {
      ...queryParams,
      before: subredditRecords[0].paginationId,
      after: undefined,
      page: page - 1,
      type: 'sr',
    });
  }

  let nextUrl;
  if (subredditRecords.length >= 25) {
    nextUrl = SearchPageHandler.buildURL(urlParams, {
      ...queryParams,
      before: undefined,
      after: subredditRecords[subredditRecords.length - 1].paginationId,
      page: page + 1,
      type: 'sr',
    });
  }

  return (
    <div className='SearchPage__communitiesNav'>
      <PaginationButtons
        preventUrlCreation={ true }
        compact={ true }
        nextUrl={ nextUrl }
        prevUrl={ prevUrl }
      />
    </div>
  );
};

const renderCommunities = (pageData, subredditRecords, renderingPosts) => (
  <div className='SearchPage__communities'>
    { communitiesHeader(renderingPosts, pageData) }
    { communityResults(subredditRecords) }
    { shouldPaginateCommunities(pageData, subredditRecords, renderingPosts)
      ? communitiesPaginationButtons(pageData, subredditRecords) : null }
  </div>
);

const linksHeader = (sort, time) => (
  <div className='SearchPage__linksHeader clearfix'>
  <div className='SearchPage__linksHeaderTitle'>Posts</div>
  <div className='SearchPage__linksHeaderTools'>
    <div className='SearchPage__linksHeaderSort'>
      {/*<SortSelector
        app={ app }
        sortValue={ sort }
        sortOptions={ [
          SORTS.RELEVANCE,
          SORTS.HOT,
          SORTS.NEW,
          SORTS.TOP,
          SORTS.COMMENTS,
        ] }
        onSortChange={ this.handleSortChange }
      />*/}
    </div>
    <div className='SearchPage__linksHeaderSort'>
      {/*<SortSelector
        app={ app }
        sortValue={ time }
        sortOptions={ [
          SORTS.ALL_TIME,
          SORTS.PAST_YEAR,
          SORTS.PAST_MONTH,
          SORTS.PAST_WEEK,
          SORTS.PAST_DAY,
          SORTS.PAST_HOUR,
        ] }
        onSortChange={ this.handleTimeChange }
      />*/}
    </div>
  </div>
</div>
);

const postResults = (pageData, postRecords) => {
  return (
    <div className='SearchPage__links'>
      { linksHeader() }
      <div className='SearchPage__linksResults'>
        <PostsList loading={ false } postRecords={ postRecords } />
      </div>
    </div>
  );
};

const showNoResults = (query) => {
  return query ? noResultsMsg(query) : helpfulMsg();
};

const searchResults = (pageData, searchRequest) => {
  const { posts, subreddits }= searchRequest;
  const renderingPosts = !!posts.length;
  const renderingSubreddits = !!subreddits.length;
  const noResults = !(searchRequest.loading || renderingPosts || renderingSubreddits);
  const query = pageData.queryParams.q;

  if (noResults) {
    return showNoResults(query);
  }

  return (
    <div>
      { renderingSubreddits ? renderCommunities(pageData, subreddits, renderingPosts) : null }
      { renderingPosts ? postResults(pageData, posts) : null }
    </div>
  );
};

const _SearchPage = (props) => {
  const { pageData, searchRequest } = props;

  return (
    <div className='SearchPage BelowTopNav'>
      { !searchRequest || searchRequest.loading
        ? searchLoading()
        : searchResults(pageData, searchRequest) }
    </div>
  );
};

const pageDataSelector = state => state.platform.currentPage;

const searchRequestSelector = state => {
  const pageData = pageDataSelector(state);
  const requestParams = SearchPageHandler.PageParamsToSearchRequestParams(pageData);
  const requestId = paramsToSearchRequestId(requestParams);
  return state.searchRequests[requestId];
};

const combineSelector = (pageData, searchRequest) => ({ pageData, searchRequest});

const searchPageSelector = createSelector(
  pageDataSelector,
  searchRequestSelector,
  combineSelector,
);

export const SearchPage = connect(searchPageSelector)(_SearchPage);
