import './styles.less';
import React from 'react';
import { connect } from 'react-redux';
import { Modal } from '@r/widgets/modal';
import { ApprovalStatusBanner } from 'app/components/ApprovalStatusBanner';
import { DropdownRow } from 'app/components/Dropdown';
import { getStatusBy, getApprovalStatus } from 'lib/modToolHelpers.js';

import * as modActions from 'app/actions/modTools';

const T = React.PropTypes;

export class ModeratorModal extends React.Component {
  render() {
    return (
      <div className='ModeratorModalWrapper'>
        <Modal
          id={ this.props.modModalId }
          className='DropdownModal ModeratorModal'
        >
          <ApprovalStatusBanner
            status={ getApprovalStatus(this.props.isApproved,
                                       this.props.isRemoved,
                                       this.props.isSpam,) }
            statusBy={ getStatusBy(this.props.isApproved,
                                   this.props.isRemoved,
                                   this.props.isSpam,
                                   this.props.removedBy,
                                   this.props.approvedBy,) }
            pageName={ 'moderatorModal' }
          />
          <div onClick={ this.props.onClick }>
            <div className='ModeratorModalRowWrapper'>
              <DropdownRow
                icon='delete_remove'
                text='Remove'
                onClick={ this.props.onRemove }
                isSelected={ this.props.isRemoved }
              />
              <DropdownRow
                icon='spam'
                text='Spam'
                onClick={ this.props.onSpam }
                isSelected={ this.props.isSpam }
              />
              <DropdownRow
                icon='check-circled'
                text='Approve'
                onClick={ this.props.onApprove }
                isSelected={ this.props.isApproved }
              />
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

ModeratorModal.propTypes = {
  id: T.string.isRequired,
  modModalId: T.string.isRequired,
  onClick: T.func,
  onSpam: T.func.isRequired,
  onApprove: T.func.isRequired,
  onRemove: T.func.isRequired,
  isApproved: T.bool.isRequired,
  isRemoved: T.bool.isRequired,
  isSpam: T.bool.isRequired,
  removedBy: T.string,
  approvedBy: T.string,
};

const mapDispatchToProps = (dispatch, { id }) => ({
  onSpam: () => dispatch(modActions.remove(id, true)),
  onApprove: () => dispatch(modActions.approve(id)),
  onRemove: () => dispatch(modActions.remove(id, false)),
});

export default connect(null, mapDispatchToProps)(ModeratorModal);
