import React from 'react';

class Loading extends React.Component {
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate (nextProps, nextState) {
    return false;
  }

  render () {
    return (
      <div className='loading-indicator'>
        <p>
          <span className='glyphicon loading glyphicon-refresh'></span>
        </p>
      </div>
    );
  }
}

function LoadingFactory(app) {
  return app.mutate('core/components/loading', Loading);
}

export default LoadingFactory;
