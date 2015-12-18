import React from 'react';
import querystring from 'querystring';
import constants from '../../constants';

import BasePage from './BasePage';
import ListingContainer from '../components/ListingContainer';
import ListingPaginationButtons from '../components/ListingPaginationButtons';
import Loading from '../components/Loading';

const PropTypes = React.PropTypes;

class UserSavedPage extends BasePage {
  get track () {
    return 'activities';
  }

  constructor(props) {
    super(props);

    this.state.compact = props.compact;
  }

  componentDidMount() {
    super.componentDidMount();
    this.props.app.on(constants.COMPACT_TOGGLE, this._onCompactToggle);
    this._onCompactToggle = this._onCompactToggle.bind(this);
  }

  _onCompactToggle(compact) {
    this.setState({ compact });
  }

  componentWillUnmount() {
    this.props.app.off(constants.COMPACT_TOGGLE, this._onCompactToggle);
  }

  componentDidMount() {
    super.componentDidMount();

    let {app, userName} = this.props;
    app.emit(constants.TOP_NAV_SUBREDDIT_CHANGE, 'u/' + userName);
  }

  render() {
    const { actionName, page, token, app, apiOptions, ctx } = this.props;
    const { compact } = this.state;

    let { activities, user } = this.state.data;
    let loaded = this.state.loaded;

    if (!loaded || typeof activities === 'undefined') {
      return (
        <Loading />
      );
    }

    let nextUrl;
    let prevUrl;

    if (activities.length) {
      const firstId = activities[0].name;
      const lastId = activities[activities.length - 1].name;

      if (page > 0) {
        let prevQuery = {
          ...ctx.query,
          count: 25,
          page: page - 1,
          before: firstId,
          after: undefined,
        };

        prevUrl = '?' + querystring.stringify(prevQuery);
      }

      const nextQuery = {
        ...ctx.query,
        count: 25,
        page: page + 1,
        after: lastId,
        before: undefined,
      };

      nextUrl = '?' + querystring.stringify(nextQuery);
    }

    if (activities.length === 0) {
      return (
        <div className='alert alert-info vertical-spacing-top'>
          <p>{ `You have no ${actionName.toLowerCase()} links or comments.` }</p>
        </div>
      );
    } else {
      return (
        <div className='user-page user-saved'>
          <ListingContainer
            user={ user }
            app={ app }
            showHidden={ true }
            listings={ activities }
            firstPage={ page }
            hideSubredditLabel={ false }
            token={ token }
            hideUser={ false }
            apiOptions={ apiOptions }
            winWidth={ ctx.winWidth }
            compact={ compact }
            listingClassName={ 'vertical-spacing-top' }
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

  static propTypes = {
    actionName: PropTypes.string.isRequired,
    apiOptions: PropTypes.object,
    data: PropTypes.object,
    page: PropTypes.number,
    sort: PropTypes.string,
    userName: PropTypes.string.isRequired,
  }
}

export default UserSavedPage;
