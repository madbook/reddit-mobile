/**
 * Helper component that enables intercepting click events on node-widget/ModalTarets
 */
import React from 'react';
// Note: we have to use the
// unconnected version of ModalTarget to make the subclassing work as expected.
// connect returns a wrapped component so we can't extend the prototype chain.
import { _ModalTarget, toggleModal } from '@r/widgets/modal';
import { connect } from 'react-redux';

const T = React.PropTypes;

const modalTargetDispatcher = (dispatch, { id }) => ({
  onToggleModal: () => dispatch(toggleModal(id)),
});

export default connect(null, modalTargetDispatcher)(
  class InterceptableModalTarget extends _ModalTarget {
    static propTypes = {
      ..._ModalTarget.propTypes,
      interceptClick: T.func.isRequired,
    };

    makeHandler() {
      const superProps = super.makeHandler();
      return {
        ...superProps,
        onClick: e => {
          if (this.props.interceptClick(e)) {
            return;
          }

          superProps.onClick(e);
        },
      };
    }
  }
);
