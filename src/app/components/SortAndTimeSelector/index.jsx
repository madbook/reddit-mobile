import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import * as navigationActions from '@r/platform/actions';
import { METHODS } from '@r/platform/router';

import { listingTime } from 'lib/listingTime';

import SortSelector from 'app/components/SortSelector';
import { SORTS } from 'app/sortValues';

const T = React.PropTypes;

const SortAndTimeSelector = props => {
  const {
    className,
    sort,
    sortOptions,
    onSortChange,
    time,
    timeOptions,
    onTimeChange,
  } = props;

  return (
    <div className={ `SortAndTimeSelector ${className}` }>
      <SortSelector
        id='posts-sort-selector'
        title='Sort posts by:'
        sortValue={ sort }
        sortOptions={ sortOptions }
        onSortChange={ onSortChange }
      />
      { time &&
        <SortSelector
          id='posts-time-selector'
          sortValue={ time }
          sortOptions={ timeOptions }
          onSortChange={ onTimeChange }
        />
      }
    </div>
  );
};

SortAndTimeSelector.propTypes = {
  className: T.string,
  onSortChange: T.func.isRequired,
  onTimeChange: T.func.isRequired,
  sort: SortSelector.sortType.isRequired,
  sortOptions: SortSelector.sortOptionsType.isRequired,
  time: SortSelector.sortType, // isn't required because the current page might
  // not have a time filter active. We use the presence of this property
  // to indicate a time selector should be shown.
  timeOptions: SortSelector.sortOptionsType.isRequired,
};

SortAndTimeSelector.defaultProps = {
  className: '',

  sortOptions: [
    SORTS.HOT,
    SORTS.TOP,
    SORTS.NEW,
    SORTS.CONTROVERSIAL,
  ],

  timeOptions: [
    SORTS.ALL_TIME,
    SORTS.PAST_YEAR,
    SORTS.PAST_MONTH,
    SORTS.PAST_WEEK,
    SORTS.PAST_DAY,
    SORTS.PAST_HOUR,
  ],
};

const mapStateToProps = createSelector(
  state => state.platform.currentPage,
  currentPage => ({ currentPage }),
);

const mapDispatchToProps = dispatch => ({
  navigateToUrl(url, query) {
    dispatch(navigationActions.navigateToUrl(METHODS.GET, url, query));
  },
});

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { currentPage } = stateProps;
  const { queryParams } = currentPage;
  const { sort = SORTS.HOT } = queryParams;
  const time = ownProps.time || listingTime(queryParams, sort);
  const { navigateToUrl } = dispatchProps;

  const onSortChange = sort => {
    navigateToUrl(currentPage.url, {
      queryParams: {
        ...queryParams,
        sort,
      },
    });
  };

  const onTimeChange = time => {
    navigateToUrl(currentPage.url, {
      queryParams: {
        ...queryParams,
        t: time,
      },
    });
  };

  return {
    ...stateProps,
    ...ownProps,
    onSortChange,
    onTimeChange,
    sort,
    time,
  };
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(SortAndTimeSelector);
