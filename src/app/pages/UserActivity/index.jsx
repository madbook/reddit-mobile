import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { UserProfileHeader } from 'app/components/UserProfileHeader';
import PostAndCommentList from 'app/components/PostAndCommentList';
import { Section } from '../UserProfile';

import { userAccountSelector } from 'app/selectors/userAccount';
import UserActivityHandler from 'app/router/handlers/UserActivity';
import { paramsToActiviesRequestId } from 'app/models/ActivitiesRequest';

const mapStateToProps = createSelector(
  userAccountSelector,
  state => state.activitiesRequests,
  (_, props) => props, // props is the page props splatted,
  (myUser, activities, pageProps) => {
    const activitiesParams = UserActivityHandler.PageParamsToActivitiesParams(pageProps);
    const activitiesId = paramsToActiviesRequestId(activitiesParams);

    return ({
      myUser,
      queriedUserName: pageProps.urlParams.userName,
      activitiesId,
      currentActivity: pageProps.queryParams.activity,
    });
  },
);

export const UserActivityPage = connect(mapStateToProps)(props => {
  const { myUser, queriedUserName, activitiesId, currentActivity } = props;
  const isMyUser = !!myUser && myUser.name === queriedUserName;

  return (
    <div className='UserProfilePage BelowTopNav'>
      <Section>
        <UserProfileHeader
          userName={ queriedUserName }
          isMyUser={ isMyUser }
          currentActivity={ currentActivity }
        />
      </Section>
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
