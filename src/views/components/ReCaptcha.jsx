import React from 'react';

import BaseComponent from './BaseComponent';

const T = React.PropTypes;

class ReCaptcha extends BaseComponent {
  static propTypes = {
    elementId: T.string,
    sitekey: T.string.isRequired,
    theme: T.oneOf(['light', 'dark']),
    type: T.oneOf(['image', 'audio']),
    size: T.oneOf(['normal', 'compact']),
    tabindex: T.number,
    onSuccess: T.func,
    onExpiration: T.func,
  };

  static defaultProps = {
    elementId: 'g-recaptcha',
    theme: 'light',
    type: 'image',
    size: 'normal',
    tabindex: 0,
  };

  componentDidMount() {
    const {
      elementId,
      sitekey,
      theme,
      type,
      size,
      tabindex,
      onSuccess,
      onExpiration,
    } = this.props;

    window.grecaptcha.render(elementId, {
      sitekey,
      theme,
      type,
      size,
      tabindex,
      callback: onSuccess,
      'expired-callback': onExpiration,
    });
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    const { elementId } = this.props;

    return (
      <div id={ elementId } />
    );
  }
}

export default ReCaptcha;
