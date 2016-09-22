import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { Anchor } from '@r/platform/components';

import { UserProfileHeader } from 'app/components/UserProfileHeader';
import { UserProfileSummary } from 'app/components/UserProfileSummary';
import Loading from 'app/components/Loading';
import { userAccountSelector } from 'app/selectors/userAccount';

const GILD_URL_RE = /u\/.*\/gild$/;

const mapStateToProps = createSelector(
  userAccountSelector,
  (state, props) => state.accounts[props.urlParams.userName],
  (state, props) => state.accountRequests[props.urlParams.userName],
  (myUser, queriedUser, queriedUserRequest) => ({ myUser, queriedUser, queriedUserRequest }),
);

export const UserProfilePage = connect(mapStateToProps)(props => {
  const { myUser, queriedUser, queriedUserRequest, urlParams, url } = props;
  const isGildPage = GILD_URL_RE.test(url);
  const { userName: queriedUserName } = urlParams;
  const isMyUser = !!myUser && myUser.name === queriedUserName;

  return (
    <div className='UserProfilePage BelowTopNav'>
      <Section>
        <UserProfileHeader userName={ queriedUserName } isMyUser={ isMyUser } />
      </Section>
      { isGildPage ? <GildPageContent />
        : queriedUser ? <UserProfileContent user={ queriedUser } isMyUser={ isMyUser } />
        : !queriedUserRequest || queriedUserRequest.loading ? <Loading />
        : <Loading /> /* do an error state here? */ }
    </div>
  );
});

export const Section = props => (
  <div className='UserProfilePage__section'>
    { props.children }
  </div>
);

function GildPageContent() { return (<div>Sorry, this page isn't ready yet</div>); }

const UserProfileContent = props => {
  const { user, isMyUser } = props;
  return (
    <div>
      <Section>
        <UserProfileSummary user={ user } isMyUser={ isMyUser } />
      </Section>
      { !isMyUser
        ? null
        : <Section>
          <OwnUserLinks userName={ user.name } />
        </Section>
      }
    </div>
  );
};

const OwnUserLinks = props => {
  const { userName } = props;

  return (
    <div className='UserProfilePage__ownUserLinks'>
      <UserLink iconName='save' text='Saved' href={ userLinkPath(userName, 'saved') } />
      <UserLink iconName='hide' text='Hidden' href={ userLinkPath(userName, 'hidden') } />
    </div>
  );
};

const userLinkPath = (userName, subpath) => `/user/${userName}/${subpath}`;

const UserLink = props => {
  const { text, iconName, href } = props;

  return (
    <Anchor className='UserProfilePage__userLink' href={ href }>
      <span className={ `UserProfilePage__userLinkIcon icon icon-large icon-${iconName} blue ` } />
      { text }
    </Anchor>
  );
};
