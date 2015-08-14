import React from 'react';
import constants from '../../constants';
import querystring from 'querystring';

import BasePage from './BasePage';
import MessageNav from '../components/MessageNav';
import Inbox from '../components/Inbox';
import Loading from '../components/Loading';
import TrackingPixel from '../components/TrackingPixel';

class MessagesPage extends BasePage {
  render() {
    var content;

    if (!this.state.loaded || !this.state.data.messages) {
      content = (
        <Loading />
      );
    } else {
      var messages = this.state.data.messages;
      var tracking;

      var view = this.props.view.toLowerCase();

      if (this.state.data.messages.meta && this.props.renderTracking) {
        tracking = (
          <TrackingPixel
            url={ this.state.data.messages.meta.tracking }
            user={ this.props.user }
            loid={ props.loid }
            loidcreated={ props.loidcreated }
          />);
      }

      content = (
        <Inbox
          app={this.props.app}
          messages={messages}
          key={'mesages-' + view}
          user={this.state.data.user}
          token={this.props.token}
          apiOptions={this.props.apiOptions}
        />
      );
    }

    return (
      <div className={`message-page message-${view}`}>
        <div>
          <MessageNav {...this.props} user={ this.state.data.user } />
          { content }
        </div>

        { tracking }
      </div>
    );
  }
}

//TODO: someone more familiar with this component could eventually fill this out better
MessagesPage.propTypes = {
  // apiOptions: React.PropTypes.object,
  data: React.PropTypes.object,
  renderTracking: React.PropTypes.string,
  view: React.PropTypes.string.isRequired,
};

export default MessagesPage;
