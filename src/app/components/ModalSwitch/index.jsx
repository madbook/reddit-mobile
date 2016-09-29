import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import ReportingModal from '../ReportingModal';
import * as reportingActions from 'app/actions/reporting';

function ModalSwitch(props) {
  switch (props.modal.type) {
    case reportingActions.MODAL_TYPE:
      return <ReportingModal { ...props.modal } />;
    default:
      return null;
  }
}

const mapStateToProps = createSelector(
  state => state.modal,
  modal => ({ modal }),
);

export default connect(mapStateToProps)(ModalSwitch);
