import React from 'react';

import BasePage from './BasePage';
import ListingContainer from '../components/ListingContainer';
import Loading from '../components/Loading';
import UserActivitySubnav from '../components/UserActivitySubnav';

class UserActivityPage extends BasePage {
  static propTypes = {
    activity: React.PropTypes.string.isRequired,
    after: React.PropTypes.string,
    before: React.PropTypes.string,
    data: React.PropTypes.object,
    page: React.PropTypes.number,
    sort: React.PropTypes.string,
    userName: React.PropTypes.string.isRequired,
  };
  
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

    const {
      page = 0,
      sort = 'hot',
      compact,
      apiOptions,
      token,
      app,
      ctx,
      userName,
    } = this.props;

    const user = state.data.user;
    const activities = state.data.activities;

    return (
      <div className="user-page user-activity">
        <UserActivitySubnav
          app={ app }
          sort={ sort }
          name={ userName }
          activity={ props.activity }
          user={ user }
        />

        <ListingContainer
          app={ app }
          compact={ compact }
          ctx={ ctx }
          listings={ activities }
          firstPage={ page }
          page={ page }
          hideSubredditLabel={ false }
          user={ user }
          token={ token }
          hideUser={ true }
          apiOptions={ apiOptions }
          winWidth={ ctx.winWidth }
        />
      </div>
    );
  }
}

export default UserActivityPage;
