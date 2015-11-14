import React from 'react';
import BaseComponent from './BaseComponent';

import constants from '../../constants';

class InfoBar extends BaseComponent {
  constructor(props) {
    super(props);

    this.state.notifications = props.info || [];
    this.close = this.close.bind(this);
  }

  close() {
    let { app } = this.props;
    let message = this.state.notifications[0];

    if (message.type === constants.messageTypes.GLOBAL) {
      app.emit(constants.HIDE_GLOBAL_MESSAGE, new Date(message.expires));
    }
    
    let slicedNotifications = this.state.notifications.slice(1);
    this.setState({notifications: slicedNotifications});
  }

  render() {
    let notifications = this.state.notifications;
    let info = notifications[0];

    if (info) {
      let content;
      if (info.html) {
        content = (
          <div
            className='infobar-html'
            dangerouslySetInnerHTML={{__html: info.html}}
          />
        );
      } else if (info.text) {
        content = (
          <p className='infobar-text'>{info.text}</p>
        );
      }

      return (
        <div className='infobar-wrap'>
          <article className='infobar'>
            <button
              type='button'
              className='close'
              onClick={ this.close }
              aria-label='Close'
            >
              <span aria-hidden='true'>&times;</span>
            </button>
            { content }
          </article>
        </div>
      );
    } else {
      return (
        <div className='infobar-placeholder'></div>
      );
    }
  }

  static propTypes = {
    close: React.PropTypes.func.isRequired,
    content: React.PropTypes.object.isRequired,
  }
}

export default InfoBar;