import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import * as overlayActions from 'app/actions/overlay';

import OverlayMenu from 'app/components/OverlayMenu';
import SearchBar from './SearchBar';


export const SearchBarOverlay = (props) => {
  const { pageData, closeSearchBar } = props;
  const { queryParams, urlParams } = pageData;
  const { subredditName } = urlParams;
  const { q: initialQuery } = queryParams;

  return (
    <OverlayMenu fullscreen={ true } onCloseOverlay={ closeSearchBar }>
      <div className='SearchBarOverlay__searchArea'>
        <div
          className='SearchBarOverlay__close'
          onClick={ closeSearchBar }
        >
          <span className='icon icon-nav-arrowback' />
        </div>
        <div className='SearchBarOverlay__barContainer'>
          <SearchBar
            subreddit={ subredditName }
            initialValue={ initialQuery ? decodeURIComponent(initialQuery) : '' }
          />
        </div>
      </div>
    </OverlayMenu>
  );
};

export default connect(
  createSelector(
    state => state.platform.currentPage,
    (pageData) => ({ pageData }),
  ),
  dispatch => ({
    closeSearchBar: () => dispatch(overlayActions.closeSearchBar()),
  }),
)(SearchBarOverlay);
