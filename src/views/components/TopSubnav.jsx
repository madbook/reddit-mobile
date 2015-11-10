import React from 'react';

import BaseComponent from './BaseComponent';
import SortDropdown from '../components/SortDropdown';

class TopSubnav extends BaseComponent {
  constructor(props) {
    super(props);
  }

  render() {
    var user = this.props.user;

    if (user) {
      var loginLink = <a className='TopSubnav-a' href={ '/u/' + user.name }>{ user.name }</a>;
    } else {
      loginLink = <a className='TopSubnav-a' href={ this.props.app.config.loginPath } data-no-route='true'>Log in / Register</a>;
    }

    var sort = null;
    if (!this.props.hideSort){
      sort = <SortDropdown
               app={ this.props.app }
               sort={ this.props.sort }
               excludedSorts={ this.props.excludedSorts }
               list={ this.props.list }
               baseUrl={ this.props.ctx.url }
               className='pull-left'
             />;
    }

    return (
      <div className='TopSubnav'>
        { sort }
        <div className='pull-right'>{ loginLink }</div>
      </div>
    );
  }
}

TopSubnav.propTypes = {
  exludedSorts: React.PropTypes.arrayOf(React.PropTypes.string),
  hideSort: React.PropTypes.bool,
  list: React.PropTypes.string,
  sort: React.PropTypes.string,
};

export default TopSubnav;
