import React from 'react';

import constants from '../../constants';

import BaseComponent from './BaseComponent';
import Dropdown from '../components/Dropdown';

class SeashellsDropdown extends BaseComponent {
  static propTypes = {
    reversed: React.PropTypes.bool,
  };
  
  constructor(props) {
    super(props);

    this.state = {
      opened: false,
    };

    this._onOpen = this._onOpen.bind(this);
    this._id = Math.random();
  }

  render() {
    var reversed = this.props.reversed || false;
    var opened = this.state.opened;
    var content = opened ? this.props.children : undefined;
    var openedClass = opened ? 'rotate90' : '';
    var button = (
      <button type='button' className='SeashellsDropdown-button'>
        <span className={ 'icon-seashells ' + openedClass }></span>
      </button>
    );
    return (
      <Dropdown
        app={ this.props.app }
        right={ this.props.right }
        button={ button }
        id={ this._id }
        reversed={ reversed }
      >
        { content }
      </Dropdown>
    );
  }

  componentDidMount() {
    this.props.app.on(constants.DROPDOWN_OPEN + ':' + this._id, this._onOpen);
  }

  componentWillUnmount() {
    this.props.app.off(constants.DROPDOWN_OPEN + ':' + this._id, this._onOpen);
  }

  _onOpen(bool) {
    this.setState({opened: bool});
  }
}

export default SeashellsDropdown;
