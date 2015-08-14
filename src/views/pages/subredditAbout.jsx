import React from 'react';
import constants from '../../constants';
import process from 'reddit-text-js';

import BasePage from './BasePage';
import Loading from '../components/Loading';
import TopSubnav from '../components/TopSubnav';
import TrackingPixel from '../components/TrackingPixel';

class SubredditAboutPage extends BasePage {
  render() {
    var loading;
    var tracking;

    if (!this.state.loaded || !this.state.data.subreddit) {
      return (
        <Loading />
      );
    }

    var props = this.props;
    var app = props.app;
    var user = this.props.user;

    if (this.state.data.subreddit.meta) {
      tracking = (
        <TrackingPixel
          referrer={ props.referrer }
          url={ this.state.data.meta.tracking }
          user={ props.user }
          loid={ props.loid }
          loidcreated={ props.loidcreated }
        />);
    }

    var htmlDump;
    var data = this.state.data.subreddit;

    htmlDump = [
      <ul className='subreddit-about-numbers' key='subreddit-about-numbers'>
        <li>{ `${data.subscribers} readers` }</li>
        <li>{ `${data.accounts_active} users here now` }</li>
      </ul>,
      <div className='subreddit-about-rules' key='subreddit-about-rules'
        dangerouslySetInnerHTML={{ __html: process(data.description) }}>
      </div>
    ];

    return (
      <div className='subreddit-about-main'>
        <TopSubnav
          { ...props }
          user={ this.state.data.user }
          subreddit={ this.state.data.subreddit }
          hideSort={ true }
        />

        <div className='container' key='container'>
          { htmlDump }
        </div>

        { tracking }
      </div>
    );
  }
}

SubredditAboutPage.propTypes = {
  // apiOptions: React.PropTypes.object,
  subredditName: React.PropTypes.string.isRequired,
}

export default SubredditAboutPage;
