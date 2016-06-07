import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { Anchor } from '@r/platform/components';

import * as subredditAutocompleteActions from 'app/actions/subredditAutocomplete';
import Modal from '../Modal';
import './styles.less';

const T = React.PropTypes;

const COMMUNITY_DEFAULT = 'Search for a community';
const AUTOCOMPLETE_TITLE = 'Communities';
const RECENT_COMMUNITY_TITLE = 'Recently visited';
const SUBREDDIT_LIMIT = 7;

class PostSubmitCommunityModal extends React.Component {
  static propTypes = {
    title: T.string.isRequired,
    subreddits: T.array.isRequired,
    onSubredditInput: T.func.isRequired,
    onExitModal: T.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.onSubredditInput = e => props.onSubredditInput(e.target.value);
    this.renderSubredditRow = this.renderSubredditRow.bind(this);
  }

  render() {
    const { onExitModal, title, subreddits } = this.props;

    return (
      <Modal
        exitTo='/submit'
        onExit={ onExitModal }
        titleText='Post to a community'
      >
        <div className='PostSubmitCommunity'>
          <div className='PostSubmitCommunity__search'>
            <div className='icon icon-search'></div>
            <div className='PostSubmitCommunity__search-input'>
              <input
                placeholder={ COMMUNITY_DEFAULT }
                onChange={ this.onSubredditInput }
              />
            </div>
          </div>

          <div className='PostSubmitCommunity__subreddits'>
            <div className='PostSubmitCommunity__subreddits-title'>
              { title }
            </div>
            <div className='PostSubmitCommunity__subreddits-list'>
              { subreddits.map(this.renderSubredditRow) }
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  renderSubredditRow({ subredditName, iconUrl }) {
    const style = iconUrl ? { backgroundImage: `url(${iconUrl})` } : null;

    return (
      <Anchor
        className='PostSubmitCommunity__subreddits-row'
        key={ subredditName }
        href={ `/r/${subredditName}/submit` }
      >
        <div className='PostSubmitCommunity__subreddits-icon'>
          <div className='PostSubmitCommunity__subreddits-icon-snoo' style={ style }></div>
        </div>
        <div className='PostSubmitCommunity__subreddits-name'>
          { `r/${subredditName}` }
        </div>
      </Anchor>
    );
  }
}


const mapStateToProps = createSelector(
  state => state.autocompleteSubreddits,
  state => state.recentSubreddits,
  state => state.subreddits,
  (autocompleteSubreddits, recentSubreddits, subreddits) => {
    // normalize subreddit meta data

    if (autocompleteSubreddits.subredditNames.length) {
      const subreddits = autocompleteSubreddits.subredditNames.slice(0, SUBREDDIT_LIMIT);
      return {
        title: AUTOCOMPLETE_TITLE,
        subreddits: subreddits.map(subredditName => {
          return { subredditName, iconUrl: null };
        }),
      };
    }

    return {
      title: RECENT_COMMUNITY_TITLE,
      subreddits: recentSubreddits.slice(0, SUBREDDIT_LIMIT).map(subredditName => {
        const subredditMetaData = subreddits[subredditName];
        const iconUrl = subredditMetaData ? subredditMetaData.iconImage : null;
        return { subredditName, iconUrl };
      }),
    };
  }
);

const dispatcher = dispatch => ({
  onSubredditInput: val => dispatch(subredditAutocompleteActions.fetch(val)),
  onExitModal: () => dispatch(subredditAutocompleteActions.resetAutocomplete()),
});

export default connect(mapStateToProps, dispatcher)(PostSubmitCommunityModal);
