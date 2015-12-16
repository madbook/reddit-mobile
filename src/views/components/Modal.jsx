import React from 'react';
import BaseComponent from './BaseComponent';

class Modal extends BaseComponent {
  static propTypes = {
    open: React.PropTypes.bool,
  };
  
  constructor(props) {
    super(props);

    this.state = {
      open: props.open || false,
    };

    this.closeModal = this.closeModal.bind(this);
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.open) {
      this.setState({open: nextProps.open});
    }
  }

  closeModal () {
    this.setState({open: false});
  }

  render () {

    const style = {
      display: 'none',
    };

    let openClass = '';
    if (this.state.open) {
      openClass = 'in';
      style.display = 'block';
    }

    return (
      <section>
        <div className={ `modal fade ${openClass}` } style={ style }>
          <div className='modal-dialog modal-sm Modal-small'>
            <div className='modal-content'>
              <div className='modal-tiny-header clearfix' >
                <button
                  type='button'
                  className='close'
                  onClick={ this.closeModal }
                  aria-label='Close'
                ><span aria-hidden='true'>&times;</span></button>
              </div>
              <div className='modal-body'>
                { this.props.children }
              </div>
            </div>
          </div>
        </div>
        <div className={ `modal-backdrop fade ${openClass}` } style={ style }></div>
      </section>
    );
  }

}

export default Modal;
