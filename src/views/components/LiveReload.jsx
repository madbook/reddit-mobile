import React from 'react';

class LiveReload extends React.Component {
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate (nextProps, nextState) {
    return false;
  }

  render () {
    return (
      <script src="//localhost:35729/livereload.js?snipver=1"></script>
    );
  }
}

function LiveReloadFactory(app) {
  return app.mutate('core/components/liveReload', LiveReload);
}

export default LiveReloadFactory;
