import React from 'react';
import BaseComponent from './BaseComponent';

const _INDICATOR_PADDING = 2;

class TextSubNav extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      indicatorWidth: '0px',
      indicatorLeft: 0,
    };
    this._moveIndicator = this._moveIndicator.bind(this);
  }

  render() {
    return (
      <nav className='TextSubNav shadow'>
        <div className='TextSubNav-title'>
          { this.props.userName }
        </div>
        <ul ref='ul' className='TextSubNav-ul list-unstyled'>
          { this.props.children }
        </ul>
        <div
          ref='indicator'
          className='TextSubNav-indicator'
          style={ {marginLeft: this.state.indicatorLeft, width: this.state.indicatorWidth} }
        />
      </nav>
    );
  }

  componentDidMount() {
    this._moveIndicator();
  }

  componentDidUpdate() {
    this._moveIndicator();
  }

  _moveIndicator() {
    const ul = this.refs.ul;
    const active = this.refs.ul.querySelector('.active');

    if (active) {
      const ulWidth = ul.getBoundingClientRect().width;
      const rect = active.getBoundingClientRect();
      const width = Math.round(rect.width) + _INDICATOR_PADDING * 2 + 'px';
      const left = Math.round(rect.left - ulWidth / 2) - _INDICATOR_PADDING + 'px';

      if (width != this.state.indicatorWidth || left != this.state.indicatorLeft) {
        this.setState({indicatorWidth: width, indicatorLeft: left});
      }
    } else if (this.state.indicatorWidth != 0) {
      this.setState({indicatorWidth: 0});
    }
  }

  static propTypes = {
    userName: React.PropTypes.string.isRequired,
  }
}

export default TextSubNav;
