import React from 'react';
import ReactServerDom from 'react-dom/server';
import { Provider } from 'react-redux';
import App from '../../app';
import { themeClass } from './themeClass';

const env = process.env.NODE_ENV || 'production';
const clientJsSrc = env === 'production' ? 'ProductionClient.js' : 'Client.js';

export default function(data, store) {
  const assetPath = data.assetPath || '';

  return ReactServerDom.renderToStaticMarkup(
    <html lang='en'>
      <head>
        <title>Reddit</title>
        <meta charSet='utf8'/>
        <meta name='viewport' content='width=device-width, initial-scale=1'/>
        <script
          id='data'
          dangerouslySetInnerHTML={ {
            __html: `window.___r = ${JSON.stringify(data)}`,
          } }
        ></script>
        <link rel='stylesheet' href='/Client.css'/>
      </head>
      <body className={ themeClass(data.theme) }>
        <div
          id='container'
          dangerouslySetInnerHTML={ {
            __html: ReactServerDom.renderToString(
              <Provider store={ store }>
                <App />
              </Provider>
            ),
          } }
        />
        <script type='text/javascript' src={ `${assetPath}/${clientJsSrc}` }></script>
      </body>
    </html>
  );
}
