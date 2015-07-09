import React from 'react/addons';
import Utils from '../../lib/danehansen/utils/Utils';
import constants from '../../constants';
import globals from '../../globals';

var CSSTransitionGroup = React.addons.CSSTransitionGroup;

class Dropdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      opened: false,
      touch: false,
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

    return (
      <div className={className} onMouseEnter={ this.state.touch ? null : this._onMouseEnter }
           onMouseLeave={ this.state.touch ? null : this._onMouseLeave } onClick={ this.state.touch ? this._onClick : null }>
        { this.props.button }
        <CSSTransitionGroup transitionName="Dropdown-tab">
          { tab }
        </CSSTransitionGroup>
      </div>
    );
  }

  componentDidMount() {
    this.setState({touch: Utils.touch()});
  }

  componentWillUnmount() {
    if (this.state.touch) {
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
    if (this.state.touch) {
      globals().app.on(constants.DROPDOWN_OPEN, this._close);
    }
  }

  _close() {
    this.componentWillUnmount();
    this.setState({opened: false});
    globals().app.emit(constants.DROPDOWN_OPEN + ':' + this.props.id, false);
  }
}

export default Dropdown;
