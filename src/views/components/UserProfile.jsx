import React from 'react';
import moment from 'moment';

class UserProfile extends React.Component {
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate (nextProps, nextState) {
    return (nextProps !== this.props || nextState !== this.state);
  }

  render () {
    var props = this.props;
    var userProfile = props.userProfile;

    var created = moment(userProfile.created * 1000);

    return (
      <article className={ 'user-profile' }>
        <ul>
          <li className='h1'>{ userProfile.link_karma } Karma</li>
          <li className='h1'>Created { created.format('ll') }</li>
          <li className='h1'>
            Trophy Case
            <ul>
            </ul>
          </li>
        </ul>
      </article>
    );
  }
}

function UserProfileFactory(app) {
  return app.mutate('core/components/userProfile', UserProfile);
}

export default UserProfileFactory;
