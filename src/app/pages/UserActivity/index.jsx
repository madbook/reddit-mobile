import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { UserProfileHeader } from 'app/components/UserProfileHeader';
import PostAndCommentList from 'app/components/PostAndCommentList';
import SortAndTimeSelector from 'app/components/SortAndTimeSelector';

import { Section } from '../UserProfile';

import { userAccountSelector } from 'app/selectors/userAccount';
import UserActivityHandler from 'app/router/handlers/UserActivity';
import { paramsToActiviesRequestId } from 'app/models/ActivitiesRequest';

const mapStateToProps = createSelector(
  userAccountSelector,
  (state, props) => state.accounts[props.urlParams.userName.toLowerCase()],
  (state, props) => state.accountRequests[props.urlParams.userName],
  state => state.activitiesRequests,
  (_, props) => props, // props is the page props splatted,
  (myUser, queriedUser, queriedUserRequest, activities, pageProps) => {
    const activitiesParams = UserActivityHandler.pageParamsToActivitiesParams(pageProps);
    const activitiesId = paramsToActiviesRequestId(activitiesParams);
    const isVerified = queriedUser && queriedUser.verified;

    return {
      myUser,
      queriedUser,
      queriedUserName: pageProps.urlParams.userName,
      queriedUserRequest,
      activitiesId,
      currentActivity: pageProps.queryParams.activity,
      isVerified,
    };
  },
);

export const UserActivityPage = connect(mapStateToProps)(props => {
  const {
    myUser,
    queriedUser,
    queriedUserName,
    queriedUserRequest,
    activitiesId,
    currentActivity,
    isVerified,
  } = props;
  const isMyUser = !!myUser && myUser.name === queriedUserName;
  const queriedUserSubreddit = queriedUser ? queriedUser.subredditName : '';
  const loaded = !!queriedUserRequest && !queriedUserRequest.loading;

  return (
    <div className='UserProfilePage'>
      <Section>
        { loaded && <UserProfileHeader
            userName={ queriedUserName }
            userSubreddit={ queriedUserSubreddit }
            isMyUser={ isMyUser }
            currentActivity={ currentActivity }
            isVerified={ isVerified }
          />
        }
      </Section>
      { loaded && <SortAndTimeSelector className='UserProfilePage__sorts' /> }
      <PostAndCommentList
        requestLocation='activitiesRequests'
        requestId={ activitiesId }
        thingProps={ {
          userActivityPage: true,
        } }
      />
    </div>
  );
});
