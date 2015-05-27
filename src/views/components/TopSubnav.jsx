import React from 'react';

import SortDropdown from '../components/SortDropdown';

class TopSubnav extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var user = this.props.user;
    if (user) {
      var loginLink = <a className='TopSubnav-a' href={ '/u/' + user.name }>{ user.name }</a>;
    } else {
      loginLink = <a className='TopSubnav-a' href={ this.props.loginPath } data-no-route='true'>Log in / Register</a>;
    }

    var sort = null;
    if (!this.props.hideSort){
      sort = <SortDropdown 
               app={ this.props.app }
               random={ this.props.random }
               sort={ this.props.sort }
               excludedSorts={ this.props.excludedSorts }
               list={ this.props.list }
               baseUrl={ this.props.baseUrl }
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

export default TopSubnav;
