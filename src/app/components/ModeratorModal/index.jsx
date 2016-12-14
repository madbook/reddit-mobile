import React from 'react';
import { Modal } from '@r/widgets/modal';

const T = React.PropTypes;

export function ModeratorModal(props) {

  return (
    <div className='ModeratorModalWrapper'>
      <Modal
        id={ props.id }
        className='DropdownModal ModeratorModal'
      >
        <div onClick={ props.onClick }>
          { props.children }
        </div>
      </Modal>
    </div>
  );
}

ModeratorModal.propTypes = {
  id: T.string.isRequired,
  onClick: T.func,
};
