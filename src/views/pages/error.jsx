import React from 'react';
import globals from '../../globals';
import url from 'url';

import BaseComponent from '../components/BaseComponent';

const TRANSIENT_ERROR_MESSAGE = 'Try again?';
const IDEMPOTENT_ERROR_MESSAGE = 'Go back?';

class ErrorPage extends BaseComponent {
  constructor(props) {
    super(props);
    this._desktopSite = this._desktopSite.bind(this);
  }

  componentDidUpdate() {
    globals().app.emit('page:update', this.props);
  }

  _desktopSite(e) {
    e.preventDefault();
    globals().app.emit('route:desktop', globals().url);

    global.location = `https://www.reddit.com${globals().app.fullPathName()}`;
  }

  _reload(e) {
    global.location.reload();
  }

  render() {
    var referrer = this.props.referrer
    var parsedReferrer = referrer ? url.parse(referrer) : {};
    var sameOrigin = referrer && parsedReferrer.host === url.parse(this.props.origin).host;
    var back = sameOrigin ? parsedReferrer.path : '/';
    var status = this.props.status;
    var callToAction;

    if (this.props.originalUrl === back) {
      back = '/';
    }

    if (status === 404) {
      callToAction = (
        <div>
          <h3>
            <a href="javascript: void 0;"
              onClick={ this._desktopSite } >
              Try the desktop site instead?
            </a>
          </h3>
          <h3>
            <a href={ back }>{ IDEMPOTENT_ERROR_MESSAGE }</a>
          </h3>
        </div>
      );
    } else if (status === 403 || status === 401) {
      callToAction = <h3><a href={ back }>{ IDEMPOTENT_ERROR_MESSAGE }</a></h3>;
    } else {
      callToAction = <h3><a href="javascript: void 0;" onClick={ this._reload }>{ TRANSIENT_ERROR_MESSAGE }</a></h3>;
    }

    return (
      <div>
        <div className='container'>
          <div className='row'>
            <div className='col-xs-12'>
              <h1>{ this.props.title }</h1>
              { callToAction }
            </div>
          </div>
        </div>
      </div>
    );
  }

  static populateData (api, props, synchronous) {
    var defer = q.defer();
    defer.resolve();
    return defer.promise;
  }
}

// TODO: someone more familiar with this component could eventually fill this out
ErrorPage.propTypes = {
  status: React.PropTypes.number.isRequired,
  originalUrl: React.PropTypes.string.isRequired,
  title: React.PropTypes.string.isRequired,
  referrer: React.PropTypes.string,
};

export default ErrorPage;
