import React from 'react';

class ErrorPage extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidUpdate() {
    this.props.app.emit('page:update');
  }

  render() {
    var link = this.props.referrer || '/';

    return (
      <div>
        <div className='container'>
          <div className='row'>
            <div className='col-xs-12'>
              <h1>{ this.props.title }</h1>
              <h3><a href={ link }>Go back?</a></h3>
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

function ErrorPageFactory(app) {
  return app.mutate('core/pages/error', ErrorPage);
}

export default ErrorPageFactory;
