import React from 'react';
import { Anchor } from '@r/platform/components';

import './styles.less';

const T = React.PropTypes;

const Modal = props => (
  <div className='Modal'>
    <div className='Modal__menubar'>
      <Anchor href={ props.exitTo } className='Modal__menubar-close'>
        <span className='icon icon-nav-close icon-large'></span>
      </Anchor>
      <span className='Modal__menubar-text'>{ props.titleText }</span>
    </div>
    <div className='Modal__body'>
      { props.children }
    </div>
  </div>
);

Modal.propTypes = {
  exitTo: T.string.isRequired,
  titleText: T.string,
};

Modal.defaultProps = {
  titleText: '',
};

export default Modal;
