import React from 'react';
import constants from '../../constants';

import SeashellIcon from '../components/icons/SeashellIcon';
import Dropdown from '../components/Dropdown';

class SeashellsDropdown extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      opened: false,
    };

    this._onOpen = this._onOpen.bind(this);
    this._id = Math.random();
  }

  render() {
    var opened = this.state.opened;
    var button = <button className='SeashellsDropdown-button'><SeashellIcon played={opened} /></button>;
    return (
      <Dropdown app={ this.props.app } right={ true } button={ button } id={ this._id }>
        {this.props.children}
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
