import React from 'react';

import formatNumber from '../../lib/formatNumber';
import blankTargets from '../../lib/blankTargets';

import BasePage from './BasePage';
import Loading from '../components/Loading';
import TopSubnav from '../components/TopSubnav';

class SubredditAboutPage extends BasePage {
  static propTypes = {
    // apiOptions: React.PropTypes.object,
    subredditName: React.PropTypes.string.isRequired,
  };

  get track () {
    return 'subreddit';
  }

  render() {

    if (!this.state.loaded || !this.state.data.subreddit) {
      return (
        <Loading />
      );
    }

    const props = this.props;
    const subreddit = this.state.data.subreddit;

    let htmlDump;
    const data = this.state.data.subreddit;

    let accountsActive;
    if (data.accounts_active) {
      accountsActive = (<li>
        { `${formatNumber(data.accounts_active)} users here now` }
        </li>
      );
    }

    htmlDump = [
      <ul className='subreddit-about-numbers' key='subreddit-about-numbers'>
        <li>{ `${formatNumber(data.subscribers)} readers` }</li>
        { accountsActive }
      </ul>,
      <div
        className='subreddit-about-rules'
        key='subreddit-about-rules'
        dangerouslySetInnerHTML={ { __html: blankTargets(data.description_html) } }
      />,
    ];

    const wikiLink = (
      <a className='TopSubnav__a' href={ `${subreddit.url}wiki/index` }>
        Wiki
      </a>
    );

    return (
      <div className='subreddit-about-main'>
        <TopSubnav
          { ...props }
          user={ this.state.data.user }
          subreddit={ this.state.data.subreddit }
          leftLink={ wikiLink }
        />

        <div className='container' key='container'>
          { htmlDump }
        </div>
      </div>
    );
  }
}

export default SubredditAboutPage;
