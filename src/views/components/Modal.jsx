import React from 'react';

Modal.propTypes = {
  close: React.PropTypes.func.isRequired,
};

function Modal (props) {
  return (
    <section>
      <div className='modal fade in' style={ {display: 'block'} } >
        <div className='modal-dialog Modal__small'>
          <div className='modal-content Modal__content'>
            <button
              type='button'
              className='close Modal__close'
              onClick={ props.close }
              aria-label='Close'
            >
              <span aria-hidden='true'>&times;</span>
            </button>
            <div className='modal-body'>
              { props.children }
            </div>
          </div>
        </div>
      </div>
      <div className='modal-backdrop fade in' />
    </section>
  );
}

export default Modal;
