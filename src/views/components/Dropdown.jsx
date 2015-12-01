import React from 'react';

import constants from '../../constants';

import BaseComponent from './BaseComponent';

class Dropdown extends BaseComponent {
  constructor(props) {
    super(props);

    this.state = {
      opened: false,
    };

    this._onClick = this._onClick.bind(this);
    this._open = this._open.bind(this);
    this._close = this._close.bind(this);
    this._key = Math.random();
  }

  render() {
    var className = constants.DROPDOWN_CSS_CLASS + ' ' + (this.props.className || '');
    className += (this.props.right ? ' pull-right' : '');

    if (this.state.opened) {
      var pointer = 'stalagmite';
      var tabClass = 'Dropdown-tab shadow';
      if (this.props.reversed) {
        pointer = 'stalactite';
        tabClass += ' Dropdown-reverse-tab';
      }

      var tab = (
        <div className={ tabClass } key={ this._key }>
          <div className={pointer + (this.props.right ? ' pull-right' : '')}></div>
          <ul className='Dropdown-ul list-unstyled'>
            { this.props.children }
          </ul>
        </div>
      );
    }

    return (
      <div className={className} onClick={ this._onClick }>
        { this.props.button }
        { tab }
      </div>
    );
  }

  componentWillUnmount() {
    this.props.app.off(constants.DROPDOWN_OPEN, this._close);
  }

  _onClick() {
    if (this.state.opened) {
      this._close();
    } else {
      this._open();
    }
  }

  _open() {
    this.setState({opened: true});
    this.props.app.emit(constants.DROPDOWN_OPEN, this.props.id);
    this.props.app.emit(constants.DROPDOWN_OPEN + ':' + this.props.id, true);

    // Close once another dropdown opens
    this.props.app.on(constants.DROPDOWN_OPEN, this._close);
  }

  _close() {
    this.componentWillUnmount();
    this.setState({opened: false});
    this.props.app.emit(constants.DROPDOWN_OPEN + ':' + this.props.id, false);
  }
}

Dropdown.propTypes = {
  className: React.PropTypes.string,
  button: React.PropTypes.element.isRequired,
  id: React.PropTypes.number.isRequired,
  right: React.PropTypes.bool,
  reversed: React.PropTypes.bool,
};

export default Dropdown;
