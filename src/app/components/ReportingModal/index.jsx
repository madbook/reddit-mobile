import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import * as ModelTypes from 'apiClient/models/thingTypes';

import * as modalActions from 'app/actions/modal';
import * as reportingActions from 'app/actions/reporting';
import Loading from 'app/components/Loading';
import Report from 'app/models/Report';
import {
  getSiteRulesFromState,
  getSubredditRulesFromState,
} from 'lib/subredditRules';

import cx from 'lib/classNames';

const T = React.PropTypes;

/**
 * Get a list of rules that apply to the thing currently being reported.
 * @function
 * @param {Object} state
 * @returns {SubredditRule[]}
 */
function rulesFromState(state) {
  const {subredditName, thingId} = state.modal.props;
  const thingType = ModelTypes.thingType(thingId);

  const siteRules = getSiteRulesFromState(state);
  const subredditRules = getSubredditRulesFromState(state, subredditName, thingType);
  
  if (!subredditRules) {
    return siteRules;
  }

  return subredditRules.concat(siteRules);
}

/**
 * Component for rendering the reporting modal
 * This is the modal used to *submit* reports, not the modal mods use to
 * *view* reports.
 * @class
 * @extends {React.Component}
 */
class ReportingModal extends React.Component {
  state = {
    selectedRuleIndex: 0,
  }

  static propTypes = {
    onSubmit: T.func.isRequired,
    subredditName: T.string,
    rules: T.arrayOf(T.object),
    thingId: T.string,
  };

  render() {
    return (
      <div className='ReportingModalWrapper' onClick={ this.props.onClickOutside }>
        <div className='ReportingModal'>

          <div className='ReportingModal__title-bar'>
            <div className='ReportingModal__close' />
            <div className='ReportingModal__title'>
              Report
            </div>
          </div>

          { this.props.rules
            ? <div className='ReportingModal__options'>
                { this.props.rules.map((r, i) => this.renderReportRow(r, i)) }
              </div>
            : <Loading />
          }

          <div className='ReportingModal__submit'>
            <div
              className='ReportingModal__submit-button'
              onClick={ () => this.handleSubmit() }
            >
              REPORT TO MODERATORS
            </div>
          </div>

        </div>
      </div>
    );
  }

  handleSubmit() {
    const {
      onSubmit,
      rules,
      thingId,
    } = this.props;

    const violatedRule = rules[this.state.selectedRuleIndex];
    const report = Report.fromRule(thingId, violatedRule);
    onSubmit(report);
  }

  renderReportRow(rule, selectedRuleIndex) {
    const onClick = e => {
      e.stopPropagation();
      this.setState({ selectedRuleIndex });
    };
    const isChecked = this.state.selectedRuleIndex === selectedRuleIndex;

    const className = cx('icon', {
      'icon-check-circled': isChecked,
      'icon-circle': !isChecked,
    });

    let displayText = rule.getReportReason();
    if (rule.isSiteRule()) {
      displayText = `Reddit rule: ${displayText}`;
    }

    return (
      <div className='ReportingModal__option' onClick={ onClick } >
        <div className={ className } />
        <div className="ReportingModal__reason-text">
          { displayText }
        </div>
      </div>
    );
  }
}

const selector = createSelector(
  state => state.modal.props.thingId,
  state => state.modal.props.subredditName,
  state => rulesFromState(state),
  (thingId, subredditName, rules) => ({
    thingId,
    subredditName,
    rules,
  }),
);

const dispatcher = dispatch => ({
  onClickOutside: () => dispatch(modalActions.closeModal()),
  onSubmit: report => dispatch(reportingActions.submit(report)),
});

export default connect(selector, dispatcher)(ReportingModal);
