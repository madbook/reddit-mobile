import React from 'react';
import isEqual from 'lodash/lang/isEqual';

class BaseComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate (nextProps, nextState) {
    return (!isEqual(nextProps, this.props) || !isEqual(nextState, this.state));
  }
}

export default BaseComponent;
