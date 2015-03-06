import React from 'react';
import LiveReloadFactory from '../components/LiveReload';

var LiveReload;

class DefaultLayout extends React.Component {
  constructor(props) {
    super(props);
  }

  render () {
    var liveReload;

    var baseCSS = 'base.css';
    var fancyCSS = 'fancy.css';
    var clientJS = 'client.js';

    if (this.props.liveReload) {
      liveReload = (<LiveReload />);
    }

    if (this.props.minifyAssets) {
      baseCSS = this.props.manifest['base.css'];
      fancyCSS = this.props.manifest['fancy.css'];
      clientJS = this.props.manifest['client.min.js'];
    }

    return (
      <html>
        <head>
          <title>{ this.props.title }</title>
          <link href={ '/css/' + baseCSS } rel='stylesheet' />
          <link href={ '/css/' + fancyCSS } rel='stylesheet' media='screen' />

          <meta name='viewport' content='width=device-width, initial-scale=1.0' />
          <meta id='csrf-token-meta-tag' name='csrf-token' content={ this.props.csrf } />

          <link rel='shortcut icon' href='/favicon.ico' />
        </head>
        <body className='navbar-offcanvas-target'>
          <div id='app-container'>
            { this.props.children }
          </div>

          <script src={'/js/shims.js'}></script>
          <script src={'/js/' + clientJS}></script>
          {liveReload}
        </body>
      </html>
    );
  }
}

function DefaultLayoutFactory(app) {
  LiveReload = LiveReloadFactory(app);

  return app.mutate('core/layouts/default', DefaultLayout);
}

export default DefaultLayoutFactory;
