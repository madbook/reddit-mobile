import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import URL from 'url';

import { Anchor } from 'platform/components';
import { makeWikiPath } from 'lib/makeWikiPath';
import Loading from 'app/components/Loading';
import RedditLinkHijacker from 'app/components/RedditLinkHijacker';

const TOPNAV_HEIGHT = 48;

const wikiContent = (contentHTML, currentPath) => (
  <RedditLinkHijacker>
    <div
      className='Wiki__content'
      dangerouslySetInnerHTML={ { __html: contentHTML } }
      onClick={ handleClick(currentPath) }
    />
  </RedditLinkHijacker>
);

const handleClick = currentPath => e => {
  const url = e.target.href;
  if (url) {
    const { path, hash } = URL.parse(url);
    if (path === currentPath && hash) {
      e.preventDefault();
      const el = document.getElementById(hash.slice(1));
      document.body.scrollTop = el.offsetTop - TOPNAV_HEIGHT;
    }
  }

};

const tryLoggingIn = () => (
  <div className='Wiki__try-logging-in'>
    You may need to try <Anchor href='/login'>logging in</Anchor> to view this community
  </div>
);

const wikiLoadingError = (subredditName, user) => (
  <div className='Wiki__loading-error'>
    Sorry, there was an error loading&nbsp;
    <Anchor href={ `/r/${subredditName}` }>
      { `r/${subredditName}` }
    </Anchor>
    { user.loggedOut && tryLoggingIn() }
  </div>
);

const Wiki = (props) => {
  const {
    currentPath,
    subredditName,
    user,
    wiki,
    wikiRequest,
  } = props;

  return (
    <div className='Wiki'>
      { wiki ? wikiContent(wiki.contentHTML, currentPath)
        : wikiRequest && wikiRequest.failed ? wikiLoadingError(subredditName, user)
        : <Loading /> }
    </div>
  );
};

const mapStateToProps = createSelector(
  (state, props) => state.wikis[makeWikiPath(props.subredditName, props.path)],
  (state, props) => state.wikiRequests[makeWikiPath(props.subredditName, props.path)],
  state => state.user,
  state => state.platform.currentPage.url,
  (wiki, wikiRequest, user, currentPath) => ({ wiki, wikiRequest, user, currentPath }),
);

export default connect(mapStateToProps)(Wiki);
