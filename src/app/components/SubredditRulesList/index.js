/**
 * @module components/SubredditRulesList
 */
import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { Anchor } from '@r/platform/components';

import Loading from 'app/components/Loading';
import SubredditRule from 'app/components/SubredditRule';

const T = React.PropTypes;

/**
 * Alias
 * @typedef {module:components/SubredditRule~SubredditRulesProps} RulesProps
*/

/**
 * Component for rendering the subreddit rules list.
 * @function
 * @param {Object} props
 * @param {string} props.subredditName The name of the subreddit
 * @param {RulesProps[]} rules 
 */
function SubredditRulesList(props) {
  const {
    subredditName,
    rules,
    requestError,
  } = props;

  return (
    <div className="SubredditRulesList">
      { rules
        ? <div className="SubredditRulesList__content">
            <header>
              <h2 className="SubredditRulesList__title">
                Rules for r/{subredditName}
              </h2>
              <p className="SubredditRulesList__description">
                Rules that visitors must follow to participate. May be used as reasons to report or ban.
              </p>
            </header>
            { rules.map(r => <SubredditRule { ...r } />) }
          </div>

      : requestError
        ? <div className="SubredditRulesList__error">
            Sorry, there was an error loading&nbsp;
            <Anchor href={ `/r/${subredditName}` }>
              { `r/${subredditName}` }
            </Anchor>
          </div>

        : <Loading />
      }
    </div>
  );
}

SubredditRulesList.propTypes = {
  subredditName: T.string.isRequired,
  rules: T.arrayOf(T.shape(SubredditRule.propTypes)),
  requestError: T.bool,
};

SubredditRulesList.defaultProps = {
  rules: null,
  requestError: false,
};

const mapStateToProps = createSelector(
  (state, { subredditName }) => state.subredditRules[subredditName],
  (state, { subredditName }) => state.subredditRulesRequests[subredditName],
  (rules, subredditRulesRequest) => ({
    rules,
    requestError: subredditRulesRequest && subredditRulesRequest.failed,
  })
);

export default connect(mapStateToProps)(SubredditRulesList);
