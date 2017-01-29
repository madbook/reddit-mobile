import './styles.less';

import React from 'react';

import { Anchor } from 'platform/components';
import Account from 'apiClient/models/Account';
import { formatNumber } from 'lib/formatNumber';
import { short, long } from 'lib/formatDifference';

const T = React.PropTypes;

export const UserProfileSummary = props => {
  const { user } = props;

  return (
    <div className='UserProfileSummary'>
      <UserProfileRow>
        <UserProfileBadge
          text={ formatNumber(user.linkKarma) }
          subtext='KARMA'
          half={ true }
        >
          <UserProfileBadgeIcon iconName='karma' color='orangered' />
        </UserProfileBadge>
        <UserProfileBadge
          text={ short(user.createdUTC) }
          subtext='REDDIT AGE'
          half={ true }
        >
          <UserProfileBadgeIcon iconName='cake' color='mint' />
        </UserProfileBadge>
      </UserProfileRow>
      <GoldInfo { ...props } />
    </div>
  );
};

UserProfileSummary.propTypes = {
  user: T.instanceOf(Account),
  isMyUser: T.bool,
};

const GoldInfo = props => {
  const { user, isMyUser } = props;

  if (isMyUser) {
    if (!user.goldExpiration) { return null; }

    return (
      <UserProfileRow>
        <UserProfileBadge
          text={ long(user.goldExpiration) }
          subtext='of reddit gold remaining'
        >
          <UserProfileBadgeIcon iconName='gold-snoo' color='gold' />
        </UserProfileBadge>
      </UserProfileRow>
    );
  }

  return (
    <Anchor href={ `/user/${user.name}/gild` }>
      <UserProfileRow>
        <UserProfileBadge
          text={ `Give ${user.name} gold` }
          subtext='show your appreciation'
        >
          <UserProfileBadgeIcon iconName='gold-snoo' color='gold' />
        </UserProfileBadge>
      </UserProfileRow>
    </Anchor>
  );
};

const UserProfileRow = props => (
  <div className='UserProfileSummary__row'>
    { props.children }
  </div>
);

// these need to be `function` instead of `const`, because of
// hoisting and`babel-transform-react-constant-elements`
function UserProfileBadgeIcon(props) {
  const { iconName, color } = props;
  return (
    <span className={ `UserProfileSummary__badgeIcon icon icon-${iconName} ${color} ` } />
  );
}

const UserProfileBadge = props => {
  const { text, subtext, half } = props;
  return (
    <div className={ `UserProfileSummary__badge ${half ? 'half' : ''}` }>
      { props.children }
      <div className='UserProfileSummary__text-wrapper'>
        <div className='UserProfileSummary__badge-text'>{ text }</div>
        <div className='UserProfileSummary__badge-subtext'>{ subtext }</div>
      </div>
    </div>
  );
};
