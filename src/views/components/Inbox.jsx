import React from 'react';
import moment from 'moment';

import MessagePreview from './MessagePreview';
import BaseComponent from './BaseComponent';

class Inbox extends BaseComponent {
  constructor(props) {
    super(props);

    this.state = {
      messages: props.messages || [],
    };

    this.onSubmit = this.onSubmit.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (nextProps !== this.props || nextState !== this.state);
  }

  onSubmit (message) {
    let messages = this.state.messages || [];

    if (this.props.isReply) {
      messages.push(message);
    } else {
      messages.splice(0, 0, message);
    }

    this.setState({
      messages: messages,
    });
  }

  render() {
    var props = this.props;
    var messages = this.state.messages;
    var onSubmit = this.onSubmit;

    return (
      <div className={ 'Inbox' }>
        {
          messages.map(function(m, i) {
            var isLastReply = !props.isReply || props.isReply && (props.messages.length - 1) === i;
            return (
              <MessagePreview
                lastReply={isLastReply}
                user={props.user}
                token={props.token}
                key={'message-' + m.name}
                message={m}
                api={props.api}
                apiOptions={props.apiOptions}
                onSubmit={onSubmit}
              />
            );
          })
        }
      </div>
    );
  }
}

export default Inbox;
