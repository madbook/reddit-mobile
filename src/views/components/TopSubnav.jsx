import React from 'react';

import SortDropdown from '../components/SortDropdown';

function TopSubnav (props) {
  const { user } = props;

  if (user) {
    var loginLink = (
      <a className='TopSubnav-a' href={ '/u/' + user.name }>{ user.name }</a>
    );
  } else {
    loginLink = (
      <a
        className='TopSubnav-a'
        href={ props.app.config.loginPath }
        data-no-route='true'
      >Log in / Register</a>
    );
  }

  var sort = null;
  if (!props.hideSort) {
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

  return (
    <div className='TopSubnav'>
      { sort }
      <div className='pull-right'>{ loginLink }</div>
    </div>
  );
}

TopSubnav.propTypes = {
  exludedSorts: React.PropTypes.arrayOf(React.PropTypes.string),
  hideSort: React.PropTypes.bool,
  list: React.PropTypes.string,
  sort: React.PropTypes.string,
};

export default TopSubnav;
