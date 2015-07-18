import React from 'react/addons';
import constants from '../../constants';
import globals from '../../globals';
import Utils from '../../lib/danehansen/utils/Utils';

import BaseComponent from './BaseComponent';

var CSSTransitionGroup = React.addons.CSSTransitionGroup;

class Dropdown extends BaseComponent {
  constructor(props) {
    super(props);

    this.state = {
      opened: false,
    };

    this._onMouseEnter = this._onMouseEnter.bind(this);
    this._onMouseLeave = this._onMouseLeave.bind(this);
    this._onClick = this._onClick.bind(this);
    this._open = this._open.bind(this);
    this._close = this._close.bind(this);
    this._key = Math.random();
  }

  render() {
    var className = 'Dropdown ' + (this.props.className || '');
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
    var touch = globals().touch;

    return (
      <div className={className} onMouseEnter={ touch ? null : this._onMouseEnter }
           onMouseLeave={ touch ? null : this._onMouseLeave } onClick={ touch ? this._onClick : null }>
        { this.props.button }
        <CSSTransitionGroup transitionName="Dropdown-tab">
          { tab }
        </CSSTransitionGroup>
      </div>
    );
  }

  componentWillUnmount() {
    if (globals().touch) {
      globals().app.off(constants.DROPDOWN_OPEN, this._close);
    }
  }

  _onMouseEnter() {
    this._open();
  }

  _onMouseLeave() {
    this._close();
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
    globals().app.emit(constants.DROPDOWN_OPEN, this.props.id);
    globals().app.emit(constants.DROPDOWN_OPEN + ':' + this.props.id, true);

    // Close once another dropdown opens
    if (globals().touch) {
      globals().app.on(constants.DROPDOWN_OPEN, this._close);
    }
  }

  _close() {
    this.componentWillUnmount();
    this.setState({opened: false});
    globals().app.emit(constants.DROPDOWN_OPEN + ':' + this.props.id, false);
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
