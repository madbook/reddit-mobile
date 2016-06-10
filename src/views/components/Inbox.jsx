import React from 'react';

import MessagePreview from './MessagePreview';
import BaseComponent from './BaseComponent';

class Inbox extends BaseComponent {
  static propTypes = {
  };
  
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
    if (!this.props.showReplies) {
      return;
    }

    const messages = this.state.messages || [];

    if (this.props.isReply) {
      messages.push(message);
    } else {
      messages.splice(0, 0, message);
    }

    this.setState({
      messages,
    });
  }

  render() {
    const props = this.props;
    const messages = this.state.messages;
    const onSubmit = this.onSubmit;

    return (
      <div className='Inbox'>
        {
          messages.map(function(m, i) {
            const isLastReply = (
              !props.isReply ||
              props.isReply && (props.messages.length - 1) === i
            );

            return (
              <MessagePreview
                app={ props.app }
                lastReply={ isLastReply }
                user={ props.user }
                token={ props.token }
                key={ `message-${m.name}` }
                message={ m }
                apiOptions={ props.apiOptions }
                onSubmit={ onSubmit }
              />
            );
          })
        }
      </div>
    );
  }
}

export default Inbox;
