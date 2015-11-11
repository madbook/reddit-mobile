import React from 'react';

import SnooIcon from '../components/icons/SnooIcon';
import BaseComponent from './BaseComponent';

class Loading extends BaseComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className='Loading'>
        <SnooIcon key='1' />
      </div>
    );
  }
}

export default Loading;
