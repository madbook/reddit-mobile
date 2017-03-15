import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import ReportingModal from 'app/components/ReportingModal';
import RulesModal from 'app/components/RulesModal';

import * as reportingActions from 'app/actions/reporting';
import * as rulesModalActions from 'app/actions/rulesModal';

const ModalSwitch = props => {
  switch (props.modal.type) {
    case reportingActions.MODAL_TYPE:
      return <ReportingModal { ...props.modal } />;
    case rulesModalActions.RULES_MODAL_TYPE:
      return <RulesModal { ...props.modal.props } />;
    default:
      return null;
  }
};

const mapStateToProps = createSelector(
  state => state.modal,
  modal => ({ modal }),
);

export default connect(mapStateToProps)(ModalSwitch);
