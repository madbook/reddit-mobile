import React from 'react';
import querystring from 'querystring';

import constants from '../../constants';

import BasePage from './BasePage';
import ListingContainer from '../components/ListingContainer';
import ListingPaginationButtons from '../components/ListingPaginationButtons';
import Loading from '../components/Loading';
import UserActivitySubnav from '../components/UserActivitySubnav';

class UserActivityPage extends BasePage {
  constructor(props) {
    super(props);

    this.state.compact = props.compact;
    this._onCompactToggle = this._onCompactToggle.bind(this);
  }

  componentDidMount() {
    super.componentDidMount();
    this.props.app.on(constants.COMPACT_TOGGLE, this._onCompactToggle);
  }

  _onCompactToggle(compact) {
    this.setState({ compact });
  }

  componentWillUnmount() {
    this.props.app.off(constants.COMPACT_TOGGLE, this._onCompactToggle);
  }

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
    const compact = state.compact;

    const page = props.page || 0;
    const token = props.token;
    const app = props.app;
    const user = state.data.user;
    const activities = state.data.activities;
    const sort = props.sort || 'hot';
    const name = props.userName;

    let prevUrl;
    let nextUrl;

    if (activities.length) {
      const firstId = activities[0].name;
      const lastId = activities[activities.length - 1].name;

      if (page > 0) {
        let prevQuery = {
          ...props.ctx.query,
          count: 25,
          page: page - 1,
          before: firstId,
          after: undefined,
        };

        prevUrl = '?' + querystring.stringify(prevQuery);
      }

      const nextQuery = {
        ...props.ctx.query,
        count: 25,
        page: page + 1,
        after: lastId,
        before: undefined,
      };

      nextUrl = '?' + querystring.stringify(nextQuery);
    }

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
          compact={ compact }
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
        >
          <ListingPaginationButtons
            compact={ compact }
            prevUrl={ prevUrl }
            nextUrl={ nextUrl }
          />
        </ListingContainer>
      </div>
    );
  }
}

//TODO: someone more familiar with this component could eventually fill this out better
UserActivityPage.propTypes = {
  activity: React.PropTypes.string.isRequired,
  after: React.PropTypes.string,
  before: React.PropTypes.string,
  data: React.PropTypes.object,
  page: React.PropTypes.number,
  sort: React.PropTypes.string,
  userName: React.PropTypes.string.isRequired,
};

export default UserActivityPage;
