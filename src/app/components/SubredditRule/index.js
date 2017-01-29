/**
 * @module components/SubredditRule
 */
import './styles.less';

import React from 'react';
import SubredditRuleModel from 'apiClient/models/SubredditRule';

const T = React.PropTypes;
const RULE_TARGET = SubredditRuleModel.RULE_TARGET;

// Mapping of RULE_TARGET values to strings for display
const KIND_STRINGS = {
  [RULE_TARGET.ALL]: 'Posts & Comments',
  [RULE_TARGET.POST]: 'Posts only',
  [RULE_TARGET.COMMENT]: 'Comments only',
};

/**
 * @typedef {Object} SubredditRuleProps
 * @property {string} descriptionHTML HTML formatted description
 * @property {RULE_TARGET} kind The kind of thing the rule applies to
 * @property {string} shortName Plaintext title of the rule
 */

/**
 * Component for rendering a single subreddit rule.
 * @function
 * @param {SubredditRule} props
 * @returns {React.Component}
 */
export default function SubredditRule(props) {
  const {
    descriptionHTML,
    kind,
    shortName,
  } = props;

  const kindDisplayString = KIND_STRINGS[kind];

  return (
    <div className="SubredditRule">
      <div className="SubredditRule__title">{ shortName }</div>
      <div className="SubredditRule__meta">{ kindDisplayString }</div>
      { descriptionHTML && (
        <div className="SubredditRule__description">
          <div dangerouslySetInnerHTML={ {__html: descriptionHTML} } />
        </div>
      ) }
    </div>
  );
}

SubredditRule.propTypes = {
  descriptionHTML: T.string,
  kind: T.oneOf(Object.values(RULE_TARGET)).isRequired,
  shortName: T.string.isRequired,
};

SubredditRule.defaultProps = {
  descriptionHTML: '',
};
