import React from 'react';

import propTypes from '../../propTypes';
import SortSelector from './SortSelector';
import { SORTS } from '../../sortValues';

function renderSortSelector(currentSort, currentTime, app, baseUrl) {
  // define callback
  const handleSortChange = function(newSort) {
    app.redirect(`${baseUrl}?sort=${newSort}`);
  };

  const handleTimeChange = function(newTime) {
    app.redirect(`${baseUrl}?sort=${currentSort}&time=${newTime}`);
  };

  return (
    <div className='pull-left'>
      <div className='TopSubnav__sortDropdown'>
        <SortSelector
          app={ app }
          sortValue={ currentSort }
          sortOptions={ [
            SORTS.HOT,
            SORTS.TOP,
            SORTS.NEW,
            SORTS.CONTROVERSIAL,
          ] }
          onSortChange={ handleSortChange }
          title='Sort posts by:'
        />
      </div>
      { currentTime
        ? <div className='TopSubnav__sortDropdown'>
            <SortSelector
              app={ app }
              sortValue={ currentTime }
              sortOptions={ [
                SORTS.ALL_TIME,
                SORTS.PAST_YEAR,
                SORTS.PAST_MONTH,
                SORTS.PAST_WEEK,
                SORTS.PAST_DAY,
                SORTS.PAST_HOUR,
              ] }
              onSortChange={ handleTimeChange }
            />
          </div>
        : null }
    </div>
  );
}

function TopSubnav(props) {
  const { user, subreddit } = props;
  const showSort = !props.hideSort && !props.leftLink;

  let navLink;

  if (subreddit && !props.hideSort) {
    navLink = (
      <a className='TopSubnav__a' href={ `${subreddit.url}about` }>
        About this community
      </a>
    );
  } else if (user) {
    navLink = <a className='TopSubnav__a' href={ `/u/${user.name}` }>{ user.name }</a>;
  } else {
    navLink = (
      <a
        className='TopSubnav__a'
        href={ props.app.config.loginPath }
      >
        Log in / Register
      </a>
    );
  }

  let leftLink;
  if (props.leftLink) {
    leftLink = <div className='pull-left'>{ props.leftLink }</div>;
  }

  if (!showSort && user) {
    return <div />;
  }

  return (
    <div className='TopSubnav'>
      { showSort ? renderSortSelector(props.sort, props.time, props.app, props.ctx.url) : null }
      { leftLink }
      <div className='TopSubnav__navLink'>{ navLink }</div>
    </div>
  );
}

TopSubnav.propTypes = {
  exludedSorts: React.PropTypes.arrayOf(React.PropTypes.string),
  hideSort: React.PropTypes.bool,
  list: React.PropTypes.string,
  sort: React.PropTypes.string,
  user: propTypes.user,
  subreddit: propTypes.subreddit,
  leftLink: React.PropTypes.node,
};

export default TopSubnav;
