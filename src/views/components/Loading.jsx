import React from 'react';

import RIcon from '../components/icons/RIcon';
import SnooIcon from '../components/icons/SnooIcon';
import BaseComponent from './BaseComponent';

class Loading extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {flipFlop: true};
    this._mounted = true;
    this._iconOn = this._iconOn.bind(this);
    this._iconOff = this._iconOff.bind(this);
    this._iconSwapped = this._iconSwapped.bind(this);
    this._wait = this._wait.bind(this);
  }

  render() {
    var icon = this.state.flipFlop ? <SnooIcon ref='icon'/> : <RIcon ref='icon'/>;

    return (
      <div className='Loading'>
        {icon}
      </div>
    );
  }

  componentDidMount() {
    this._iconSwapped();
  }

  _iconSwapped() {
    if (this._mounted) {
      this.refs.icon.tweenOn(this._iconOn);
    }
  }

  _iconOn() {
    if (this._mounted) {
      this._timeout = setTimeout(this._wait, 1000);
    }
  }

  _wait() {
    this._timeout = null;
    if (this._mounted) {
      this.refs.icon.tweenOff(this._iconOff);
    }
  }

  _iconOff() {
    if (this._mounted) {
      this.setState({flipFlop: !this.state.flipFlop}, this._iconSwapped);
    }
  }

  componentWillUnmount() {
    clearTimeout(this._timeout);
    this._mounted = false;
  }
}

export default Loading;
