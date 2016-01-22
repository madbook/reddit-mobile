import React from 'react';

import propTypes from '../../propTypes';
import SortDropdown from '../components/SortDropdown';

function TopSubnav (props) {
  const { user, subreddit } = props;
  let navLink;

  if (subreddit && !props.hideSort) {
    navLink = (
      <a className='TopSubnav-a' href={ `${subreddit.url}about` }>
        About this community
      </a>
    );
  } else if (user) {
    navLink = <a className='TopSubnav-a' href={ '/u/' + user.name }>{ user.name }</a>;
  } else {
    navLink = (
      <a
        className='TopSubnav-a'
        href={ props.app.config.loginPath }
      >
        Log in / Register
      </a>
    );
  }

  var sort = null;
  if (!props.hideSort && !props.leftLink) {
    sort = (
      <SortDropdown
        app={ props.app }
        sort={ props.sort }
        excludedSorts={ props.excludedSorts }
        list={ props.list }
        baseUrl={ props.ctx.url }
        className='pull-left'
      />
    );
  }

  let leftLink;
  if (props.leftLink) {
    leftLink = <div className='pull-left'>{ props.leftLink }</div>;
  }

  return (
    <div className='TopSubnav'>
      { sort }
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
