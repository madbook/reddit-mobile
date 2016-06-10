import React from 'react';
import cookies from 'cookies-js';
import { find as _find, filter as _filter } from 'lodash/collection';

import BaseComponent from './BaseComponent';
import constants from '../../constants';
import blankTargets from '../../lib/blankTargets';

const PropTypes = React.PropTypes;

const EU_COOKIE_MESSAGE = (
  <p>Cookies help us deliver our Services.
     By using our Services, you agree to our use of cookies.
     <a
       target="_blank" href="https://www.reddit.com/help/privacypolicy"
     >
       Learn More
     </a>
  </p>
);

let InfoBarEUCookieFirstShow = true;

class InfoBar extends BaseComponent {
  static propTypes = {
    messages: PropTypes.array.isRequired,
    app: PropTypes.object.isRequired,
    showEUCookieMessage: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);

    this.state.messages = props.messages || [];

    this.close = this.close.bind(this);
    this.incrementCookieNoticeSeen = this.incrementCookieNoticeSeen.bind(this);
    this.handleNewMessage = this.handleNewMessage.bind(this);
    this.removeEUCookieMessage = this.removeEUCookieMessage.bind(this);
    this.removeMessage = this.removeMessage.bind(this);
  }

  componentDidMount() {
    const { app, messages } = this.props;
    const hasEUCookie = _find(messages, {type: constants.messageTypes.EU_COOKIE});

    app.on(constants.NEW_INFOBAR_MESSAGE, this.handleNewMessage);

    if (hasEUCookie) {
      app.on('route:start', this.incrementCookieNoticeSeen);
      if (InfoBarEUCookieFirstShow) {
        this.incrementCookieNoticeSeen();
        InfoBarEUCookieFirstShow = false;
      }
    }
  }

  componentWillUnmount() {
    const { app } = this.props;
    app.off('route:start', this.incrementCookieNoticeSeen);
    app.off(constants.NEW_INFOBAR_MESSAGE, this.handleNewMessage);
  }

  componentWillReceiveProps(nextProps) {
    this.removeEUCookieMessage(nextProps);
  }

  incrementCookieNoticeSeen(e, num=1) {
    const { app } = this.props;
    const oldCookie = parseInt(cookies.get('EUCookieNotice')) || 0;
    const options = {};

    const date = new Date();
    date.setFullYear(date.getFullYear() + 2);
    options.expires = date;

    let newNum;
    if (num !== constants.EU_COOKIE_HIDE_AFTER_VIEWS) {
      newNum = oldCookie + num;
      cookies.set('EUCookieNotice', newNum, options);
    } else {
      cookies.set('EUCookieNotice', num, options);
    }

    if ([num, newNum].indexOf(constants.EU_COOKIE_HIDE_AFTER_VIEWS) !== -1) {
      app.off('route:start', this.incrementCookieNoticeSeen);
    }
  }

  removeEUCookieMessage(nextProps) {
    if (!nextProps.showEUCookieMessage && this.props.showEUCookieMessage) {
      this.removeMessage((message) => {
        if (message.type !== constants.messageTypes.EU_COOKIE) {
          return message;
        }
      });
    }
  }

  removeMessage(condition) {
    const messages = _filter(this.state.messages, condition);
    this.setState({ messages });
  }

  handleNewMessage(message) {
    const messages = this.state.messages.slice();
    messages.push(message);
    this.setState({ messages });
  }

  close() {
    const { app } = this.props;
    const message = this.state.messages[0];

    if (message.type === constants.messageTypes.GLOBAL) {
      app.emit(constants.HIDE_GLOBAL_MESSAGE, message);
    } else if (message.type === constants.messageTypes.EU_COOKIE) {
      this.incrementCookieNoticeSeen(null, constants.EU_COOKIE_HIDE_AFTER_VIEWS);
    }

    const messages = this.state.messages.slice(1);
    this.setState({ messages });
  }

  render() {
    const message = this.state.messages[0];
    let content;

    if (message) {
      if (message.type === constants.messageTypes.EU_COOKIE) {
        content = (
          <div className='infobar-html'>
            { EU_COOKIE_MESSAGE }
          </div>
        );
      } else if (message.text_html) {
        content = (
          <div
            className='infobar-html'
            dangerouslySetInnerHTML={ {__html: blankTargets(message.text_html)} }
          />
        );
      } else if (message.plainText) {
        content = (
          <p className='infobar-text'>{ message.text }</p>
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
    }

    return (
      <div className='infobar-placeholder'></div>
    );
  }
}

export default InfoBar;
