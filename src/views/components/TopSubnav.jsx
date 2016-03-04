import React from 'react';

import propTypes from '../../propTypes';
import SortSelector from './SortSelector';
import { SORTS } from '../../sortValues';

function renderSortSelector(currentSort, app, baseUrl) {
  // define callback
  const handleSortChange = function(newSort) {
    app.redirect(`${baseUrl}?sort=${newSort}`);
  };

  return (
    <div className='pull-left'>
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
      { showSort ? renderSortSelector(props.sort, props.app, props.ctx.url) : null }
      { leftLink }
      <div className='pull-right'>{ navLink }</div>
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
