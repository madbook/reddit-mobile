import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import * as overlayActions from 'app/actions/overlay';

import OverlayMenu from 'app/components/OverlayMenu';
import SearchBar from './SearchBar';


export const SearchBarOverlay = (props) => {
  const { pageData, closeOverlay } = props;
  const { queryParams, urlParams } = pageData;
  const { subredditName } = urlParams;
  const { q: initialQuery } = queryParams;

  return (
    <OverlayMenu fullscreen={ true }>
      <div className='SearchBarOverlay__searchArea'>
        <div
          className='SearchBarOverlay__close'
          onClick={ closeOverlay }
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
    closeOverlay() { dispatch(overlayActions.closeOverlay()); },
  }),
)(SearchBarOverlay);
