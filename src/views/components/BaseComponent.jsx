import React from 'react';

class BaseComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate (nextProps, nextState) {
    return (nextProps !== this.props || nextState !== this.state);
  }
}

export default BaseComponent;
