import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { Anchor } from '@r/platform/components';

import { urlWith } from 'lib/urlWith';
import { cleanObject } from 'lib/cleanObject';

const T = React.PropTypes;

export const buildPrevUrl = (records, pagingPrefix='', currentQueryParams={}) => {
  const firstId = records[0].uuid;
  const page = parseInt(currentQueryParams.page || 0);

  if (page > 0) {
    const query = {
      count: 25, // use the current params count if its defined
      ...currentQueryParams,
      before: firstId,
      after: undefined,
    };

    return urlWith(pagingPrefix, cleanObject(query));
  }
};

export const buildNextUrl = (records, pagingPrefix='', currentQueryParams={}) => {
  const lastId = records[records.length - 1].uuid;
  const page = parseInt(currentQueryParams.page || 0);

  const query = {
    count: 25,
    ...currentQueryParams,
    page: page + 1,
    after: lastId,
    before: undefined,
  };

  return urlWith(pagingPrefix, cleanObject(query));
};

const nextButton = nextUrl => (
  <Anchor href={ nextUrl } rel='next' className='PaginationButtons__button m-next'>
    NEXT
    <span className='icon icon-nav-arrowforward white' />
  </Anchor>
);

const prevButton = prevUrl => (
  <Anchor href={ prevUrl } rel='prev' className='PaginationButtons__button m-prev'>
    <span className='icon icon-nav-arrowback white' />
    PREVIOUS
  </Anchor>
);

export const PaginationButtons = (props) => {
  const { compact, records, preventUrlCreation, pageSize,
    currentQueryParams, pagingPrefix } = props;

  let { prevUrl, nextUrl } = props;

  if (!(prevUrl || preventUrlCreation)) {
    prevUrl = buildPrevUrl(records, pagingPrefix, currentQueryParams);
  }

  if (!(nextUrl || preventUrlCreation || records.length < pageSize)) {
    nextUrl = buildNextUrl(records, pagingPrefix, currentQueryParams);
  }

  return (
    <nav className='PaginationButtons'>
      <div className={ `PaginationButtons__buttons ${compact ? 'm-compact' : ''}` }>
        { prevUrl ? prevButton(prevUrl) : null }
        { nextUrl ? nextButton(nextUrl) : null }
      </div>
    </nav>
  );
};

PaginationButtons.propTypes = {
  records: T.array,
  compact: T.bool.isRequired,
  preventUrlCreation: T.bool,
  pageSize: T.number,
  currentQueryParams: T.object,
  pagingPrefix: T.string,
  prevUrl: T.string,
  nextUrl: T.string,
};

PaginationButtons.defaultProps = {
  pageSize: 25,
  pagingPrefix: '',
};

// these let you pass queryParams directly if needed
const compactSelector = (state, props) => props.compact || state.compact;

const currentQueryParamsSelector = (state, props) => {
  // if we're prevent url creation ignore query params altogether. This way
  // we won't re-render needlessly
  if (props.preventUrlCreation) { return null; }
  return props.queryParams || state.platform.currentPage.queryParams;
};

const pagingPrefixSelector = (state, props) => {
  if (props.preventUrlCreation) { return null; }
  return props.pagingPrefix || state.platform.currentPage.url;
}

const propsSelector = propName => (_, props) => props[propName];

const recordsSelector = propsSelector('records');
const pageSizeSelector = propsSelector('pageSize');
const preventUrlCreationSelector = propsSelector('preventUrlCreation');

const combineSelectors = (compact, currentQueryParams, records, preventUrlCreation,
  pageSize, pagingPrefix) =>
({
  compact, currentQueryParams, records, preventUrlCreation, pageSize, pagingPrefix,
});


const makeSelector = () => (
  createSelector(
    compactSelector,
    currentQueryParamsSelector,
    recordsSelector,
    preventUrlCreationSelector,
    pageSizeSelector,
    pagingPrefixSelector,
    combineSelectors,
  )
);

export default connect(makeSelector)(PaginationButtons);
