import React from 'react';
import Utils from '../../lib/danehansen/Utils';

class Dropdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      opened:false
    };
    this._onMouseEnter=this._onMouseEnter.bind(this);
    this._onMouseLeave=this._onMouseLeave.bind(this);
    this._onClick=this._onClick.bind(this);
    this._open=this._open.bind(this);
    this._close=this._close.bind(this);
  }

  render() {
    var touch = Utils.touch();
    var className = 'Dropdown ' + (this.props.className || '');
    className += ( this.state.opened ? ' opened' : '' );
    className += ( this.props.right ? ' right' : '' );

    return (
      <div className={className} onMouseEnter={ touch ? null : this._onMouseEnter } onMouseLeave={ touch ? null : this._onMouseLeave } onClick={touch ? this._onClick : null}>
        { this.props.button }
        <div className='Dropdown-tab shadow tween'>
          <div className={'stalagmite' + ( this.props.right ? ' right' : '' )}></div>
          <ul className='Dropdown-ul'>
            { this.props.children }
          </ul>
        </div>
      </div>
    );
  }

  _onMouseEnter() {
    this._open();
  }

  _onMouseLeave() {
    this._close();
  }

  _onClick() {
    if(this.state.opened)
      this._close();
    else
      this._open();
  }

  _open() {
    this.setState({opened:true});
    this.props.app.emit(Dropdown.OPEN + ':' + this.props.id, true);
  }

  _close() {
    this.setState({opened:false});
    this.props.app.emit(Dropdown.OPEN + ':' + this.props.id, false);
  }
}

function DropdownFactory(app) {
  return app.mutate('core/components/Dropdown', Dropdown);
}

export default DropdownFactory;
