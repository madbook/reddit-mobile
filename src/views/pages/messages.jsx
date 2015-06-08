import React from 'react';
import q from 'q';
import querystring from 'querystring';
import constants from '../../constants';

import Loading from '../components/Loading';
import Inbox from '../components/Inbox';
import TrackingPixel from '../components/TrackingPixel';

class MessagesPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: props.data || {},
    };

    this.state.loaded = this.state.data && this.state.data.data;
  }

  componentDidMount() {
    MessagesPage.populateData(this.props.api, this.props, true).done((function(data) {
      this.setState({
        data: data || {},
        loaded: true,
      });
    }).bind(this));
  }

  componentDidUpdate() {
    this.props.app.emit('page:update', this.props);
  }

  render() {
    var loading;

    var messages = (this.state.data || {}).data || {};
    var tracking;

    var app = this.props.app;
    var user = this.props.user;
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
          user={this.props.user}
          token={this.props.token}
          app={this.props.app}
          api={this.props.api}
          apiOptions={this.props.apiOptions}
        />
      );
    }

    if (this.state.data.meta && this.props.renderTracking) {
      tracking = (
        <TrackingPixel
          url={ this.state.data.meta.tracking }
          user={ this.props.user }
          loid={ this.props.loid }
          loidcreated={ this.props.loidcreated }
          compact={ this.props.compact }
          experiments={ this.props.experiments }
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
