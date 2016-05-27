import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import Loading from 'app/components/Loading';

const subredditDescription = descriptionHTML => (
  <div
    className='SubredditAbout__description'
    dangerouslySetInnerHTML={ { __html: descriptionHTML } }
  />
);

const SubredditAbout = (props) => {
  const { subreddit } = props;
  if (!subreddit) {
    return <Loading />;
  }

  const { subscribers, accountsActive, descriptionHTML } = subreddit;
  return (
    <div className='SubredditAbout'>
      { subredditDescription(descriptionHTML) }
    </div>
  );
};

const mapStateToProps = createSelector(
  (state, props) => state.subreddits[props.subredditName],
  subreddit => ({ subreddit }),
);

export default connect(mapStateToProps)(SubredditAbout);
