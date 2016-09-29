import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import * as reportingActions from 'app/actions/reporting';
import * as modalActions from 'app/actions/modal';
import cx from 'lib/classNames';

const T = React.PropTypes;

const SUBMIT_BUTTON_TEXT = 'REPORT TO MODERATORS';
const REASONS = {
  HARASSMENT: 'Threatens, harasses, or bullies',
  VIOLENCE: 'Encourages or incites violence',
  DOXING: 'Reveals personal information',
  IMPERSONATION: 'Impersonation',
  ILLEGAL_CONTENT: 'Illegal content',
  SPAM: 'Spam',
  INVOLUNTARY_PORN: 'Involuntary pornography',
  VOTE_MANIPULATION: 'Vote manipulation',
  BREAKS_REDDIT: 'Breaking reddit',
};

const REASONS_ORDER = [
  'HARASSMENT',
  'VIOLENCE',
  'DOXING',
  'IMPERSONATION',
  'ILLEGAL_CONTENT',
  'SPAM',
  'INVOLUNTARY_PORN',
  'VOTE_MANIPULATION',
  'BREAKS_REDDIT',
];

class ReportingModal extends React.Component {
  state = {
    reason: REASONS_ORDER[0],
  }

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

          <div className='ReportingModal__options'>
            { REASONS_ORDER.map(reason => this.renderReportRow(reason)) }
          </div>

          <div className='ReportingModal__submit'>
            <div
              className='ReportingModal__submit-button'
              onClick={ () => this.props.onSubmit(REASONS[this.state.reason]) }
            >
              { SUBMIT_BUTTON_TEXT }
            </div>
          </div>

        </div>
      </div>
    );
  }

  renderReportRow(reason) {
    const onClick = e => {
      e.stopPropagation();
      this.setState({ reason });
    };
    const isChecked = this.state.reason === reason;

    const className = cx('icon', {
      'icon-check-circled': isChecked,
      'icon-circle': !isChecked,
    });

    return (
      <div onClick={ onClick } className='ReportingModal__option'>
        <div className={ className } />
        { REASONS[reason] }
      </div>
    );
  }
}

ReportingModal.propTypes = {
  onSubmit: T.func.isRequired,
};

const selector = createSelector(
  state => state.modal.props,
  modalProps => ({ thingId: modalProps.thingId }),
);

const dispatcher = dispatch => ({
  onClickOutside: () => dispatch(modalActions.closeModal()),
  onSubmit: (thingId, reason) => dispatch(reportingActions.submit(thingId, reason)),
});

const mergeProps = (stateProps, dispatchProps) => ({
  ...dispatchProps,
  onSubmit: reason => dispatchProps.onSubmit(stateProps.thingId, reason),
});

export default connect(selector, dispatcher, mergeProps)(ReportingModal);
