import React from 'react';

import constants from '../../constants';
import BaseComponent from './BaseComponent';

class OverlayMenu extends BaseComponent {
  constructor(props) {
    super(props);

    this._top = constants.OVERLAY_MENU_OFFSET;

    this.state = {
      opened: false,
    };

    this._close = this._close.bind(this);
    this._toggle = this._toggle.bind(this);
    this._closeIfClickedOut = this._closeIfClickedOut.bind(this);
  }

  componentDidMount() {
    this.props.app.on('route:start', this._close);
    this.props.app.on(this.props.openedOnEventName, this._toggle);
  }

  componentWillUnmount() {
    this.props.app.off('route:start', this._close);
    this.props.app.off(constants.OVERLAY_MENU_OPEN, this._close);
    this.props.app.off(this.props.openedOnEventName, this._toggle);
  }

  _close(otherOpen) {
    if (this.state.opened) {
      this.props.app.off(constants.OVERLAY_MENU_OPEN, this._close);

      // don't fire the close event when another dropdown just opened.
      // this sort of simplifies tracking the open state ignoring event ordering
      if (typeof otherOpen !== 'boolean' || !otherOpen) {
        this.props.app.emit(constants.OVERLAY_MENU_OPEN, false);
      }

      this._fireEventNameIfNeeded(false);
      this.setState({ opened: false });
    }
  }

  _fireEventNameIfNeeded(open) {
    if (this.props.firesEventName) {
      this.props.app.emit(this.props.firesEventName, open);
    }
  }

  _toggle() {
    const newOpened = !this.state.opened;
    // Once opened we'll be listening for this overlay open event.
    // So _close will be called after coming through this a second a time.
    this.props.app.emit(constants.OVERLAY_MENU_OPEN, newOpened);
    if (newOpened) {
      this._top = document.body.scollTop;
      this.props.app.on(constants.OVERLAY_MENU_OPEN, this._close);
      this._fireEventNameIfNeeded(true);
      this.setState({opened: newOpened});
    }
  }

  render() {
    if (this.state.opened) {
      return (
        <nav
          className={ `${constants.OVERLAY_MENU_CSS_CLASS} tween` }
          onClick={ this._closeIfClickedOut }
        >
          <ul className='OverlayMenu-ul list-unstyled' onClick={ this._gobbleMenuClicks }>
          { this.props.renderChildren() }
          </ul>
        </nav>
      );
    }
    return (<div />);
  }

  _closeIfClickedOut() {
    this._close();
  }

  _gobbleMenuClicks(e) {
    e.stopPropagation();
  }

  static propTypes = {
    openedOnEventName: React.PropTypes.string.isRequired,
    firesEventName: React.PropTypes.string,
    renderChildren: React.PropTypes.func.isRequired,
  };
}

export default OverlayMenu;
