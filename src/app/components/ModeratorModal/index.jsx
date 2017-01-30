import './styles.less';
import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { endpoints, models } from '@r/api-client';
import { Modal } from '@r/widgets/modal';
import { ApprovalStatusBanner } from 'app/components/ApprovalStatusBanner';
import { DropdownRow } from 'app/components/Dropdown';
import modelFromThingId from 'app/reducers/helpers/modelFromThingId';
import { getStatusBy, getApprovalStatus } from 'lib/modToolHelpers.js';
import * as modActions from 'app/actions/modTools';

const { Modtools } = endpoints;
const DISTINGUISH_TYPES = Modtools.DISTINGUISH_TYPES;
const { ModelTypes } = models;
const T = React.PropTypes;

export class ModeratorModal extends React.Component {

  onDistinguish(distinguishType) {
    const type = (distinguishType === DISTINGUISH_TYPES.NONE
                          ? DISTINGUISH_TYPES.MODERATOR
                          : DISTINGUISH_TYPES.NONE);
    this.props.onDistinguish(type);
  }

  showDistinguish(distinguishType) {
    return !(distinguishType === DISTINGUISH_TYPES.NONE);
  }

  render() {
    let canSticky = false;
    if (this.props.targetType === ModelTypes.POST) {
      canSticky = true;
    } else if (this.props.targetType === ModelTypes.COMMENT) {
      const { isMine, target } = this.props;
      canSticky = isMine && target.parentId === target.linkId;
    }

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
              { this.props.targetType === ModelTypes.POST
                ? <DropdownRow
                    icon='nsfw'
                    text={ this.props.isNSFW ? 'Unmark NSFW' : 'Mark NSFW' }
                    onClick={ this.props.toggleNSFW }
                    isSelected={ this.props.isNSFW }
                  />
                : null
              }
              { this.props.isMine
                ? <DropdownRow
                    icon='distinguish'
                    text={ this.showDistinguish(this.props.distinguishType) ? 'Undistinguish' : 'Distinguish' }
                    onClick={ () => this.onDistinguish(this.props.distinguishType) }
                    isSelected={ this.showDistinguish(this.props.distinguishType) }
                  />
                : null
              }
              { canSticky
                ? <DropdownRow
                    icon='sticky'
                    text={ `${this.props.isSticky ? 'Unpin' : 'Pin'} as announcement` }
                    onClick={ this.props.onToggleSticky }
                    isSelected={ this.props.isSticky }
                  />
                : null
              }
              <div className='m-nonToggleActions'>
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
  toggleNSFW: T.func.isRequired,
  isSticky: T.bool.isRequired,
  isApproved: T.bool.isRequired,
  isRemoved: T.bool.isRequired,
  isSpam: T.bool.isRequired,
  removedBy: T.string,
  approvedBy: T.string,
  distinguishType: T.string,
  isMine: T.bool,
  target: T.object,
  targetType: T.oneOf([ModelTypes.COMMENT, ModelTypes.POST]).isRequired,
};

ModeratorModal.defaultProps = {
  target: null,
};

const selector = createSelector(
  (state, props) => modelFromThingId(props.id, state),
  target => ({ target })
);

const mapDispatchToProps = (dispatch, { id, isSticky, targetType }) => ({
  onSpam: () => dispatch(modActions.remove(id, true)),
  onApprove: () => dispatch(modActions.approve(id)),
  onRemove: () => dispatch(modActions.remove(id, false)),
  toggleNSFW: () => dispatch(modActions.toggleNSFW(id)),
  onDistinguish: (distinguishType) => dispatch(modActions.distinguish(id, distinguishType)),
  onToggleSticky: () => {
    if (targetType === ModelTypes.POST) {
      dispatch(modActions.setStickyPost(id, !isSticky));
    } else {
      dispatch(modActions.setStickyComment(id, !isSticky));
    }
  },
});

export default connect(selector, mapDispatchToProps)(ModeratorModal);
