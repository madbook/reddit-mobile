import React from 'react';
import globals from '../../globals';

import BaseComponent from '../components/BaseComponent';

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
  }

  render() {
    var link = globals().referrer || '/';
    var desktop;

    if (this.props.status === 404) {
      desktop = (
        <h3>
          <a href={`https://www.reddit.com${this.props.originalUrl}`}
            onClick={ this._desktopSite } >
            Try the desktop site instead?
          </a>
        </h3>
      );
    }

    return (
      <div>
        <div className='container'>
          <div className='row'>
            <div className='col-xs-12'>
              <h1>{ this.props.title }</h1>
              <h3><a href={ link }>Go back?</a></h3>
              {desktop}
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
};

export default ErrorPage;
