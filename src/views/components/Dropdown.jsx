import React from 'react';
import Utils from '../../lib/danehansen/Utils';
import constants from '../../constants';

class Dropdown extends React.Component {
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
  }

  render() {
    var className = 'Dropdown ' + (this.props.className || '');
    className += (this.state.opened ? ' opened' : '');
    className += (this.props.right ? ' pull-right' : '');

    return (
      <div className={className} onMouseEnter={ this._touch ? null : this._onMouseEnter }
           onMouseLeave={ this._touch ? null : this._onMouseLeave } onClick={ this._touch ? this._onClick : null }>
        { this.props.button }
        <div className='Dropdown-tab shadow tween'>
          <div className={'stalagmite' + (this.props.right ? ' pull-right' : '')}></div>
          <ul className='Dropdown-ul list-unstyled'>
            { this.props.children }
          </ul>
        </div>
      </div>
    );
  }

  componentDidMount() {
    this._touch = Utils.touch();
  }

  componentWillUnmount() {
    if (Utils.touch()) {
      this.props.app.off(constants.DROPDOWN_OPEN, this._close);
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
    this.props.app.emit(constants.DROPDOWN_OPEN, this.props.id);
    this.props.app.emit(constants.DROPDOWN_OPEN + ':' + this.props.id, true);

    // Close once another dropdown opens
    if (Utils.touch()) {
      this.props.app.on(constants.DROPDOWN_OPEN, this._close);
    }
  }

  _close() {
    this.componentWillUnmount();
    this.setState({opened: false});
    this.props.app.emit(constants.DROPDOWN_OPEN + ':' + this.props.id, false);
  }
}

function DropdownFactory(app) {
  return app.mutate('core/components/Dropdown', Dropdown);
}

export default DropdownFactory;
