import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { BackAnchor } from '@r/platform/components';

import OverlayMenu from 'app/components/OverlayMenu';
import SearchBar from './SearchBar';

import {
  urlWithSearchBarToggled,
} from 'app/actions/overlayMenu';

const searchUrl = (subredditOrNil) => {
  const sub = subredditOrNil ? `/r/${subredditOrNil}` : '';
  return `${sub}/search`;
};

export const SearchBarOverlay = (props) => {
  const { pageData } = props;
  const { url, queryParams, urlParams } = pageData;
  const { subredditName } = urlParams;
  const { q: initialQuery } = queryParams;

  return (
    <OverlayMenu fullscreen={ true }>
      <div className='SearchBarOverlay__searchArea'>
        <BackAnchor
          className='SearchBarOverlay__close'
          href={ urlWithSearchBarToggled(url, queryParams) }
        >
          <span className='icon icon-nav-arrowback' />
        </BackAnchor>
        <div className='SearchBarOverlay__barContainer'>
          <SearchBar
            formUrl={ searchUrl(subredditName) }
            initialValue={ initialQuery }
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
)(SearchBarOverlay);
