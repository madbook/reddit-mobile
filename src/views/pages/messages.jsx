import React from 'react';

import BasePage from './BasePage';
import MessageNav from '../components/MessageNav';
import Inbox from '../components/Inbox';
import Loading from '../components/Loading';

class MessagesPage extends BasePage {
  static propTypes = {
    data: React.PropTypes.object,
    view: React.PropTypes.string.isRequired,
  };
  
  get track () {
    return 'messages';
  }

  render() {
    let content;
    let view;

    if (!this.state.loaded || !this.state.data.messages) {
      content = (
        <Loading />
      );
    } else {
      const messages = this.state.data.messages;
      view = this.props.view.toLowerCase();
      const showReplies = (view === 'messages');

      content = (
        <Inbox
          app={ this.props.app }
          messages={ messages }
          showReplies={ showReplies }
          key={ `mesages-${view}` }
          user={ this.state.data.user }
          token={ this.props.token }
          apiOptions={ this.props.apiOptions }
        />
      );
    }

    return (
      <div className={ `message-page message-${view}` }>
        <div>
          <MessageNav {...this.props} user={ this.state.data.user } />
          { content }
        </div>
      </div>
    );
  }
}

export default MessagesPage;
