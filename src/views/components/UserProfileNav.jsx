import React from 'react';
import moment from 'moment';

class UserProfileNav extends React.Component {
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate (nextProps, nextState) {
    return (nextProps !== this.props || nextState !== this.state);
  }

  render () {
    var props = this.props;
    var name = props.userName;

    var profileActive = props.profileActive ? 'active' : '';
    var activityActive = props.activityActive ? 'active' : '';
    var gildActive = props.gildActive ? 'active' : '';

    return (
      <div className='container'>
        <ul className='nav nav-tabs vertical-spacing-top'>
          <li role='presentation' className={ profileActive }>
            <a href={`/u/${name}`}>About</a>
          </li>
          <li role='presentation' className={ activityActive }>
            <a href={`/u/${name}/activity`}>Activity</a>
          </li>
          <li role='presentation' className={ gildActive }>
            <a href={`/u/${name}/gild`}>Give Gold</a>
          </li>
        </ul>
      </div>
    );
  }
}

function UserProfileNavFactory(app) {
  return app.mutate('core/components/userProfileNav', UserProfileNav);
}

export default UserProfileNavFactory;
