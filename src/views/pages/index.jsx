import React from 'react';
import constants from '../../constants';
import querystring from 'querystring';

import BasePage from './BasePage';
import ListingList from '../components/ListingList';
import Loading from '../components/Loading';
import TopSubnav from '../components/TopSubnav';

class IndexPage extends BasePage {
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

  render() {
    var loading;
    var props = this.props;
    var data = this.state.data;
    var compact = this.state.compact;

    if (!this.state.data || !this.state.data.listings) {
      return (
        <Loading />
      );
    }

    var listings = this.state.data.listings;

    var hideSubredditLabel = props.subredditName &&
                             props.subredditName.indexOf('+') === -1 &&
                             props.subredditName !== 'all';

    var app = props.app;
    var page = props.page || 0;
    var api = app.api;
    var token = props.token;

    var user = this.state.data.user;

    var firstId;
    var lastId;
    var prevButton;
    var nextButton;
    var apiOptions = props.apiOptions;
    var subreddit = '';

    if (props.subredditName) {
      subreddit = '/r/' + props.subredditName;
    }

    if (props.multi) {
      subreddit = '/u/' + props.multiUser + '/m/' + props.multi;
    }

    var sort = props.sort || 'hot';
    var excludedSorts = [];

    if (!props.subredditName || props.multi) {
      excludedSorts.push('gilded');
    }

    if (listings.length) {
      firstId = listings[0].name;
      lastId = listings[listings.length - 1].name;

      if (page > 0) {
        var prevQuery = Object.assign({}, props.ctx.query, {
          count: 25,
          page: page - 1,
          before: firstId,
        });

        prevButton = (
          <a href={subreddit + '?' + querystring.stringify(prevQuery) } className='btn btn-sm btn-primary IndexPage-button prev'>
            <span className='glyphicon glyphicon-chevron-left'></span>
            Previous Page
          </a>
        );
      }

      var nextQuery = Object.assign({}, props.ctx.query, {
        count: 25,
        page: page + 1,
        after: lastId,
      });

      nextButton = (
        <a href={ subreddit + '?' + querystring.stringify(nextQuery) } className='btn btn-sm btn-primary IndexPage-button next'>
          Next Page
          <span className='glyphicon glyphicon-chevron-right'></span>
        </a>
      );
    }

    var showAds = !!props.config.adsPath;

    if (props.prefs && props.prefs.hide_ads === true) {
      showAds = false;
    }


    return (
      <div>
        { loading }

        <TopSubnav
          { ...props }
          user={ this.state.data.user }
          sort={ sort }
          list='listings'
          excludedSorts={ excludedSorts }
        />

        <div className={'container Listing-container' + (compact ? ' compact' : '')} ref='listings'>
          <ListingList
            { ...props }
            user={ user }
            showAds={ showAds }
            listings={ listings }
            firstPage={ page }
            page={ page }
            hideSubredditLabel={ hideSubredditLabel }
            subredditTitle={ subreddit }
          />
          <div className='pageNav IndexPage-buttons-holder-holder'>
            <div className='col-xs-12 IndexPage-buttons-holder'>
              <p className={'IndexPage-buttons' + (compact ? ' compact' : '')}>
                { prevButton } { nextButton }
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

IndexPage.propTypes = {
  before: React.PropTypes.string,
  after: React.PropTypes.string,
  data: React.PropTypes.object,
  multi: React.PropTypes.string,
  multiUser: React.PropTypes.string,
  page: React.PropTypes.number,
  prefs: React.PropTypes.shape({
    hide_ads: React.PropTypes.bool.isRequired,
  }),
  sort: React.PropTypes.string,
  subredditName: React.PropTypes.string,
};

export default IndexPage;
