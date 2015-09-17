import React from 'react';
import constants from '../../constants';
import querystring from 'querystring';

import BasePage from './BasePage';
import ListingList from '../components/ListingList';
import Loading from '../components/Loading';

class UserSavedPage extends BasePage {
  componentDidMount() {
    super.componentDidMount();

    this.props.app.emit(constants.TOP_NAV_SUBREDDIT_CHANGE, 'u/' + this.props.userName);
  }

  render() {
    var props = this.props;
    var state = this.state;

    if (!state.loaded || typeof state.data.activities === 'undefined') {
      return (
        <Loading />
      );
    }

    var title = 'Saved';

    if (props.hidden) {
      title = 'Hidden';
    }

    var page = props.page || 0;
    var token = props.token;
    var app = this.props.app;
    var activities = state.data.activities || [];
    var subreddit = '';
    var sort = props.sort || 'hot';
    var userProfile = props.userProfile || {};
    var name = props.userName;

    var noLinks;
    if (typeof activities !== 'undefined' && activities.length === 0) {
      noLinks = (
        <div className='alert alert-info vertical-spacing-top'>
          <p>{ `You have no ${title.toLowerCase()} links or comments.` }</p>
        </div>
      );
    }

    return (
      <div className='user-page user-saved'>
        <div className='container Listing-container' >
          <div className='vertical-spacing-top'>
            { noLinks }
            <ListingList
              app={app}
              showHidden={true}
              listings={activities}
              firstPage={page}
              page={page}
              hideSubredditLabel={false}
              token={token}
              hideUser={ false }
              apiOptions={ props.apiOptions }
            />
          </div>
        </div>
      </div>
    );
  } 
}

//TODO: someone more familiar with this component could eventually fill this out better
UserSavedPage.propTypes = {
  after: React.PropTypes.bool,
  // apiOptions: React.PropTypes.object,
  before: React.PropTypes.bool,
  data: React.PropTypes.object,
  hidden: React.PropTypes.bool.isRequired,
  page: React.PropTypes.number,
  sort: React.PropTypes.string,
  userName: React.PropTypes.string.isRequired,
  userProfile: React.PropTypes.object,
}

export default UserSavedPage;
