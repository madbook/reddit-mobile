import React from 'react';
import { findDOMNode } from 'react-dom';

import isEqual from 'lodash/lang/isEqual';

class BaseComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  get domNode () {
    return findDOMNode(this);
  }

  shouldComponentUpdate (nextProps, nextState) {
    return (!isEqual(nextProps, this.props) || !isEqual(nextState, this.state));
  }
}

export default BaseComponent;
