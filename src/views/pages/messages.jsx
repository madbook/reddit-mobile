import React from 'react';

import BasePage from './BasePage';
import MessageNav from '../components/MessageNav';
import Inbox from '../components/Inbox';
import Loading from '../components/Loading';

class MessagesPage extends BasePage {
  //TODO: someone more familiar with this component could eventually fill this out better
  static propTypes = {
    // apiOptions: React.PropTypes.object,
    data: React.PropTypes.object,
    view: React.PropTypes.string.isRequired,
  };
  
  get track () {
    return 'messages';
  }

  render() {
    var content;

    if (!this.state.loaded || !this.state.data.messages) {
      content = (
        <Loading />
      );
    } else {
      var messages = this.state.data.messages;

      var view = this.props.view.toLowerCase();

      content = (
        <Inbox
          app={ this.props.app }
          messages={ messages }
          key={ 'mesages-' + view }
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
