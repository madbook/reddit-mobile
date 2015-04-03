import React from 'react';
import SortDropdownFactory from '../components/SortDropdown';
var SortDropdown;

class TopSubnav extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var user = this.props.user;
    if (user) {
      var loginLink = <a className='TopSubnav-a' href={ '/u/' + user.name }>{ user.name }</a>;
    } else {
      loginLink = <a className='TopSubnav-a' href='/login' data-no-route='true'>Log in / Register</a>;
    }

    var sort = null;
    if (!this.props.hideSort){
      sort = <SortDropdown app={ this.props.app } sort={ this.props.sort } list={ this.props.list }
                           baseUrl={ this.props.baseUrl }/>;
    }

    return (
      <div className='TopSubnav'>
        { sort }
        <div className='pull-right'>{ loginLink }</div>
      </div>
    );
  }
}

function TopSubnavFactory(app) {
  SortDropdown = SortDropdownFactory(app);
  return app.mutate('core/components/TopSubnav', TopSubnav);
}

export default TopSubnavFactory;
