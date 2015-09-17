import React from 'react';
import constants from '../../constants';
import querystring from 'querystring';

import BasePage from './BasePage';
import ListingList from '../components/ListingList';
import Loading from '../components/Loading';
import UserActivitySubnav from '../components/UserActivitySubnav';

class UserActivityPage extends BasePage {
  render() {
    if (!this.state.data || !this.state.data.activities) {
      return (
        <Loading />
      );
    }

    var props = this.props;
    var state = this.state;

    var page = props.page || 0;
    var token = props.token;
    var app = props.app;
    var user = state.data.user;
    var activities = state.data.activities;
    var subreddit = '';
    var sort = props.sort || 'hot';
    var userProfile = props.userProfile || {};
    var name = props.userName;

    return (
      <div className="user-page user-activity">
        <UserActivitySubnav
          app={ app }
          sort={ sort }
          name={ name }
          activity={ props.activity }
          user={ user }
        />

        <div className={'container Listing-container'} >
          <ListingList
            app={ app }
            listings={activities}
            firstPage={page}
            page={page}
            hideSubredditLabel={false}
            user={user}
            token={token}
            hideUser={ true }
            apiOptions={ props.apiOptions }
          />
        </div>
      </div>
    );
  }
}

//TODO: someone more familiar with this component could eventually fill this out better
UserActivityPage.propTypes = {
  activity: React.PropTypes.string.isRequired,
  after: React.PropTypes.bool,
  // apiOptions: React.PropTypes.object,
  before: React.PropTypes.bool,
  data: React.PropTypes.object,
  page: React.PropTypes.number,
  sort: React.PropTypes.string,
  userName: React.PropTypes.string.isRequired,
  userProfile: React.PropTypes.object,
}

export default UserActivityPage;
