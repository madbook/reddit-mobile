import React from 'react';
import moment from 'moment';
import propTypes from '../../propTypes';

function UserProfile (props) {
  const userProfile = props.userProfile;
  const created = moment(userProfile.created * 1000);

  return (
    <article className='UserProfile'>
      <ul className='UserProfile-ul list-unstyled'>
        <li className='UserProfile-li h1'>
          <span className='icon-crown-circled'/>
          { userProfile.link_karma } Karma
        </li>
        <li className='UserProfile-li h1'>
          <span className='icon-crown-circled'/>
          Created { created.format('ll') }
        </li>
        <li className='UserProfile-li h1'>
          <span className='icon-crown-circled'/>
          Trophy Case
          <ul className='UserProfile-trophies list-unstyled'>
          </ul>
        </li>
      </ul>
    </article>
  );
}

UserProfile.propTypes = {
  userProfile: propTypes.user.isRequired,
};

export default UserProfile;
