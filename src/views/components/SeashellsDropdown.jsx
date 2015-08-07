import React from 'react';
import constants from '../../constants';
import globals from '../../globals';

import BaseComponent from './BaseComponent';
import Dropdown from '../components/Dropdown';
import SeashellIcon from '../components/icons/SeashellIcon';

class SeashellsDropdown extends BaseComponent {
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
    var openedClass = opened ? 'rotate90' : '';
    var button = (
      <button type='button' className='SeashellsDropdown-button'>
        <span className={'icon-seashells ' + openedClass}></span>
      </button>
    );
    return (
      <Dropdown
        right={ this.props.right }
        button={ button }
        id={ this._id }
        reversed={ reversed }
      >
        {this.props.children}
      </Dropdown>
    );
  }

  componentDidMount() {
    globals().app.on(constants.DROPDOWN_OPEN + ':' + this._id, this._onOpen);
  }

  componentWillUnmount() {
    globals().app.off(constants.DROPDOWN_OPEN + ':' + this._id, this._onOpen);
  }

  _onOpen(bool) {
    this.setState({opened: bool});
  }
}

SeashellsDropdown.propTypes = {
  reversed: React.PropTypes.bool,
};

export default SeashellsDropdown;
