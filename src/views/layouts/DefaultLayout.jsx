import React from 'react';
import LiveReloadFactory from '../components/LiveReload';

var LiveReload;

class DefaultLayout extends React.Component {
  constructor(props) {
    super(props);
  }

  render () {
    var assetPath = this.props.assetPath;

    var baseCSS = assetPath + '/css/';
    var fancyCSS = assetPath + '/css/';
    var clientJS = assetPath + '/js/';

    var liveReload;
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

    var canonical;

    if (this.props.url) {
      canonical = (
        <link rel='canonical' href={ `${this.props.reddit}${this.props.url}` } />
      );
    }

    var metaDescription;

    if (this.props.metaDescription) {
      metaDescription = (
        <meta name='description' content={ this.props.metaDescription } />
      );
    }

    return (
      <html>
        <head>
          <title>{ this.props.title }</title>
          <link href={ baseCSS } rel='stylesheet' />
          <link href={ fancyCSS } rel='stylesheet' media='screen' />
          <link rel='manifest' href='manifest.json' />
          { canonical }

          <meta name='viewport' content='width=device-width, initial-scale=1.0' />
          <meta name='theme-color' content='#336699' />
          <meta name='apple-mobile-web-app-capable' content='yes' />
          <meta id='csrf-token-meta-tag' name='csrf-token' content={ this.props.csrf } />
          { metaDescription }

          <link href={ `${assetPath}/favicon/64x64.png` } rel="icon shortcut" sizes="64x64" />
          <link href={ `${assetPath}/favicon/128x128.png` } rel="icon shortcut" sizes="128x128" />
          <link href={ `${assetPath}/favicon/192x192.png` } rel="icon shortcut" sizes="192x192" />
          <link href={ `${assetPath}/favicon/76x76.png` } rel="apple-touch-icon" sizes="76x76" />
          <link href={ `${assetPath}/favicon/120x120.png` } rel="apple-touch-icon" sizes="120x120" />
          <link href={ `${assetPath}/favicon/152x152.png` } rel="apple-touch-icon" sizes="152x152" />
          <link href={ `${assetPath}/favicon/180x180.png` } rel="apple-touch-icon" sizes="180x180" />
        </head>
        <body className='navbar-offcanvas-target'>
          <div id='app-container'>
            { this.props.children }
          </div>

          <script src={ clientJS }></script>
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
