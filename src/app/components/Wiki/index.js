import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { Anchor } from 'platform/components';
import { makeWikiPath } from 'lib/makeWikiPath';
import Loading from 'app/components/Loading';
import RedditLinkHijacker from 'app/components/RedditLinkHijacker';

const wikiContent = contentHTML => (
  <RedditLinkHijacker>
    <div
      className='Wiki__content'
      dangerouslySetInnerHTML={ { __html: contentHTML } }
    />
  </RedditLinkHijacker>
);

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
  const { wiki, wikiRequest, user, subredditName } = props;

  return (
    <div className='Wiki'>
      { wiki ? wikiContent(wiki.contentHTML)
        : wikiRequest && wikiRequest.failed ? wikiLoadingError(subredditName, user)
        : <Loading /> }
    </div>
  );
};

const mapStateToProps = createSelector(
  (state, props) => state.wikis[makeWikiPath(props.subredditName, props.path)],
  (state, props) => state.wikiRequests[makeWikiPath(props.subredditName, props.path)],
  state => state.user,
  (wiki, wikiRequest, user) => ({ wiki, wikiRequest, user }),
);

export default connect(mapStateToProps)(Wiki);
