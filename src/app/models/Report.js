/**
 * Represents a user report.
 * A report is generally tied to a subreddit rule, though it may also
 * be tied to a site-wide rule or completely custom.
 * @class
 */
export default class Report {
  /**
   * @constructor
   * @param {string} thingId The id of the thing this report applies to.
   * @param {string} ruleName The name of the rule violated
   * @param {string} reason The report text displayed to the user.
   */
  constructor(thingId, ruleName, reason) {
    this.thingId = thingId;
    this.ruleName = ruleName;
    this.reason = reason;
  }

  /**
   * Create a Report instance for the given thingId and SubredditRule
   * @function
   * @param {string} thingId
   * @param {SubredditRule} rule The SubredditRule being violated
   * @returns {Report}
   */
  static fromRule(thingId, rule) {
    return new Report(thingId, rule.shortName, rule.violationReason);
  }
}
