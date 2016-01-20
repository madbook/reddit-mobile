import React from 'react';

Modal.propTypes = {
  close: React.PropTypes.func.isRequired,
};

function Modal (props) {
  return (
    <section>
      <div className='modal fade in' style={ {display: 'block'} } >
        <div className='modal-dialog modal-sm Modal-small'>
          <div className='modal-content'>
            <div className='modal-tiny-header clearfix' >
              <button
                type='button'
                className='close'
                onClick={ props.close }
                aria-label='Close'
              >
                <span aria-hidden='true'>&times;</span>
              </button>
            </div>
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
