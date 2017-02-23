import RedditModel from './RedditModel';
import { SUBREDDIT_RULE } from './thingTypes';

const T = RedditModel.Types;

export default class SubredditRule extends RedditModel {
  static type = SUBREDDIT_RULE;

  static SITE_RULE_SUBREDDIT_NAME = '';
  static SITE_RULE_KEYWORD = 'site_reason_selected';

  /**
   * Valid types for rule targets.
   * @enum
   */
  static RULE_TARGET = {
    ALL: 'all',
    POST: 'link',
    COMMENT: 'comment',
  };

  static PROPERTIES = {
    createdUTC: T.number,
    description: T.string,
    descriptionHTML: T.string,
    kind: T.string,
    priority: T.number,
    shortName: T.string,
    violationReason: T.string,

    // The `subredditName` property is not returned from the API directly.  It is
    // mixed into the response data by `SubredditRulesEndpoint.get` in order
    // to enable making unique UUIDs.
    subredditName: T.string,
  };

  static API_ALIASES = {
    short_name: 'shortName',
    created_utc: 'createdUTC',
    description_html: 'descriptionHTML',
    violation_reason: 'violationReason',
  };

  /**
   * Creates a SubredditRule object from a site rule string
   * @function
   * @param {string} siteRule The rule text, e.g. "Spam"
   * @returns {SubredditRule}
   */
  static fromSiteRule(siteRule) {
    return SubredditRule.fromJSON({
      created_utc: parseInt(Date.now() / 1000),
      description_html: '',
      description: '',
      kind: SubredditRule.RULE_TARGET.ALL,
      priority: 0,
      short_name: SubredditRule.SITE_RULE_KEYWORD,
      subredditName: SubredditRule.SITE_RULE_SUBREDDIT_NAME,
      violation_reason: siteRule,
    });
  }

  /**
   * Returns whether or not this rule is a site-wide rule
   * @function
   * @returns {boolean}
   */
  isSiteRule() {
    return this.subredditName === SubredditRule.SITE_RULE_SUBREDDIT_NAME;
  }

  makeUUID(data) {
    if (this.isSiteRule()) {
      return `${data.violation_reason || data.violationReason}`;
    }
    // The actual rules model in r2 doesn't have a proper unique key, but
    // the `created_utc` timestamp should work since it shouldn't change.
    return `${data.subredditName}/${data.created_utc || data.createdUTC}`;
  }
}
