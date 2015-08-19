import React from 'react';
const ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

import SnooIcon from '../components/icons/SnooIcon';
import BaseComponent from './BaseComponent';

class Loading extends BaseComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className='Loading'>
        <ReactCSSTransitionGroup
          transitionName="loading"
          transitionAppear={ true }
          transitionLeave={ false }
        >
          <SnooIcon key='1' />
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}

export default Loading;
