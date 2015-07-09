import React from 'react';
import globals from '../../globals';

class ErrorPage extends React.Component {
  constructor(props) {
    super(props);
    this._desktopSite = this._desktopSite.bind(this);
  }

  componentDidUpdate() {
    globals().app.emit('page:update', this.props);
  }

  _desktopSite(e) {
    e.preventDefault();
    globals().app.emit('route:desktop', this.props.url);
  }

  render() {
    var link = this.props.referrer || '/';
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

export default ErrorPage;
