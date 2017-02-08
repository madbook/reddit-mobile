import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { Anchor } from '@r/platform/components';

import Loading from 'app/components/Loading';
import RedditLinkHijacker from 'app/components/RedditLinkHijacker';

const T = React.PropTypes;

/**
 * Component for rendering the "About this community" page.
 * @function
 * @param {Object} props
 * @returns React.Component
 */
function SubredditAbout(props) {
  const {
    subreddit,
    subredditName,
    subredditRequest,
    user,
  } = props;
  
  return (
    <div className='SubredditAbout'>
    { subreddit
      ? <div className="SubredditAbout__content">
          <div className="SubredditAbout__community-rules-link">
            <Anchor href={ `/r/${subredditName}/about/rules` }>
              View this community&rsquo;s rules
            </Anchor>
          </div>
          <RedditLinkHijacker>
            <div
              className='SubredditAbout__description'
              dangerouslySetInnerHTML={ { __html: subreddit.descriptionHTML } }
            />
          </RedditLinkHijacker>
        </div>
      
    : subredditRequest && subredditRequest.failed 
      ? <div className='SubredditAbout__loading-error'>
          Sorry, there was an error loading&nbsp;
          <Anchor href={ `/r/${subredditName}` }>
            { `r/${subredditName}` }
          </Anchor>
          { user.loggedOut &&
              <div className='SubredditAbout__try-logging-in'>
                You may need to try <Anchor href='/login'>logging in</Anchor> to view this community
              </div>
          }
        </div>
        
      : <Loading />
    }
    </div>
  );
}

SubredditAbout.propTypes = {
  subreddit: T.shape({
    descriptionHTML: T.string.isRequired,
  }),
  subredditName: T.string.isRequired,
  subredditRequest: T.shape({
    failed: T.bool.isRequired,
  }),
  user: T.shape({
    loggedOut: T.bool.isRequired,
  }),
};

SubredditAbout.defaultProps = {
  subreddit: null,
  subredditRequest: null,
  user: null,
};

const mapStateToProps = createSelector(
  (state, props) => state.subreddits[props.subredditName],
  (state, props) => state.subredditRequests[props.subredditName],
  state => state.user,
  (subreddit, subredditRequest, user) => ({ subreddit, subredditRequest, user }),
);

export default connect(mapStateToProps)(SubredditAbout);
