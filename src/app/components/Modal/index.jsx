import React from 'react';
import { Anchor } from '@r/platform/components';

import './styles.less';

const T = React.PropTypes;

// TODO: this was incorrectly named, and should be renamed to reflect the fact
// that is is a full page and has a url associated with it. Modals are
// components designed not to interrupt the main workflow, but this IS the
// main workflow so it's not a modal.
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
