import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import InterstitialModal from '../InterstitialListing/modal';
import ReportingModal from '../ReportingModal';

import * as modalActions from 'app/actions/modal';
import * as reportingActions from 'app/actions/reporting';

const ModalSwitch = props => {
  switch (props.modal.type) {
    case reportingActions.MODAL_TYPE:
      return <ReportingModal { ...props.modal } />;
    case modalActions.XPROMO_CLICK:
      return <InterstitialModal />;
    default:
      return null;
  }
};

const mapStateToProps = createSelector(
  state => state.modal,
  modal => ({ modal }),
);

export default connect(mapStateToProps)(ModalSwitch);
