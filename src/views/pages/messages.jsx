import React from 'react';
import constants from '../../constants';
import globals from '../../globals';
import q from 'q';
import querystring from 'querystring';

import BaseComponent from '../components/BaseComponent';
import Inbox from '../components/Inbox';
import Loading from '../components/Loading';
import TrackingPixel from '../components/TrackingPixel';

class MessagesPage extends BaseComponent {
  constructor(props) {
    super(props);

    this.state = {
      data: props.data || {},
    };

    this.state.loaded = this.state.data && this.state.data.data;
  }

  componentDidMount() {
    MessagesPage.populateData(globals().api, this.props, true).done((function(data) {
      this.setState({
        data: data || {},
        loaded: true,
      });
    }).bind(this));
  }

  componentDidUpdate() {
    globals().app.emit('page:update', this.props);
  }

  render() {
    var loading;

    var messages = (this.state.data || {}).data || {};
    var tracking;

    var view = this.props.view.toLowerCase();

    var inbox;

    if (!this.state.loaded) {
      loading = (
        <Loading />
      );
    } else {
      inbox = (
        <Inbox
          messages={messages}
          key={'mesages-' + view}
          apiOptions={this.props.apiOptions}
        />
      );
    }

    if (this.state.data.meta && this.props.renderTracking) {
      tracking = (
        <TrackingPixel
          url={ this.state.data.meta.tracking }
        />);
    }

    return (
      <div className={`message-page message-${view}`}>
        { loading }

        <div>
          { inbox }
        </div>

        { tracking }
      </div>
    );
  }

  static populateData(api, props, synchronous) {
    var defer = q.defer();

    // Only used for server-side rendering. Client-side, call when
    // componentedMounted instead.
    if (!synchronous) {
      defer.resolve(props.data);
      return defer.promise;
    }

    var options = api.buildOptions(props.apiOptions);

    if (props.view) {
      options.view = props.view;
    } else {
      options.view = 'inbox';
    }

    // Initialized with data already.
    if ((props.data || {}).data) {
      api.hydrate('messages', options, props.data);

      defer.resolve(props.data);
      return defer.promise;
    }

    api.messages.get(options).then(function(data) {
      defer.resolve(data);
    }, function(error) {
      defer.reject(error);
    });

    return defer.promise;
  }
}

export default MessagesPage;
