import React from 'react';
import SnooIcon from './icons/SnooIcon';

const T = React.PropTypes;
const TITLE = 'Reddit';
const SUBTITLE = 'Get the official mobile app';
const CTA = 'GET THE APP';

export default class SmartBanner extends React.Component {
  static propTypes = {
    url: T.string.isRequired,
    onClose: T.func,
  };

  render() {
    return (
      <div className='SmartBanner'>
        <div className='SmartBanner__left'>
          { this.renderClose() }
          { this.renderIcon() }
          { this.renderHeader() }
        </div>
        <div className='SmartBanner__right'>
          { this.renderButton() }
        </div>
      </div>
    );
  }

  renderIcon() {
    return (
      <div className='SmartBanner__icon'>
        <SnooIcon />
      </div>
    );
  }

  renderHeader() {
    return (
      <div className='SmartBanner__header'>
        <div className='SmartBanner__title'>{ TITLE }</div>
        <div className='SmartBanner__subtitle'>{ SUBTITLE }</div>
      </div>
    );
  }

  renderButton() {
    return (
      <a className='SmartBanner__button' href={ this.props.url }>{ CTA }</a>
    );
  }

  renderClose() {
    return (
      <div
        className='SmartBanner__close icon-x'
        onClick={ this.props.onClose }
      />
    );
  }
}
