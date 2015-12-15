import React from 'react';

import BasePage from './BasePage';
import ListingContainer from '../components/ListingContainer';
import Loading from '../components/Loading';
import UserActivitySubnav from '../components/UserActivitySubnav';

class UserActivityPage extends BasePage {
  get track() {
    return 'activity';
  }

  render() {
    if (!this.state.data || !this.state.data.activities) {
      return (
        <Loading />
      );
    }

    const props = this.props;
    const state = this.state;

    const page = props.page || 0;
    const token = props.token;
    const app = props.app;
    const user = state.data.user;
    const activities = state.data.activities;
    const sort = props.sort || 'hot';
    const name = props.userName;

    return (
      <div className="user-page user-activity">
        <UserActivitySubnav
          app={ app }
          sort={ sort }
          name={ name }
          activity={ props.activity }
          user={ user }
        />

        <ListingContainer
          compact={ props.compact }
          app={ app }
          listings={ activities }
          firstPage={ page }
          page={ page }
          hideSubredditLabel={ false }
          user={ user }
          token={ token }
          hideUser={ true }
          apiOptions={ props.apiOptions }
          winWidth={ props.ctx.winWidth }
        />
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
};

export default UserActivityPage;
