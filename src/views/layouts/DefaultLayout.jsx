import React from 'react';
import LiveReloadFactory from '../components/LiveReload';

var LiveReload;

class DefaultLayout extends React.Component {
  constructor(props) {
    super(props);
  }

  render () {
    var liveReload;

    var baseCSS = this.props.assetPath + '/css/';
    var fancyCSS = this.props.assetPath + '/css/';
    var clientJS = this.props.assetPath + '/js/';

    if (this.props.liveReload) {
      liveReload = (<LiveReload />);
    }

    if (this.props.minifyAssets) {
      baseCSS += this.props.manifest['base.css'];
      fancyCSS += this.props.manifest['fancy.css'];
      clientJS += this.props.manifest['client.min.js'];
    } else {
      baseCSS += 'base.css';
      fancyCSS += 'fancy.css';
      clientJS += 'client.js';
    }

    return (
      <html>
        <head>
          <title>{ this.props.title }</title>
          <link href={ baseCSS } rel='stylesheet' />
          <link href={ fancyCSS } rel='stylesheet' media='screen' />

          <meta name='viewport' content='width=device-width, initial-scale=1.0' />
          <meta id='csrf-token-meta-tag' name='csrf-token' content={ this.props.csrf } />

          <link rel='shortcut icon' href='/favicon.ico' />
        </head>
        <body className='navbar-offcanvas-target'>
          <div id='app-container'>
            { this.props.children }
          </div>

          <script src={ clientJS } async></script>
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
