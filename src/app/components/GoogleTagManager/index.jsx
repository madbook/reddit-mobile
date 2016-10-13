import React from 'react';
import { GTM_JAIL_ID } from 'app/constants';

const T = React.PropTypes;

const GoogleTagManager = props => {
  const script = `
    <script type='text/javascript'>
      if (!window.DO_NOT_TRACK) {
        var frame = document.createElement('iframe');

        frame.style.display = 'none';
        frame.referrer = 'no-referrer';
        frame.id = '${GTM_JAIL_ID}';
        frame.name = JSON.stringify({
          subreddit: '${props.subredditName || ''}',
          origin: location.origin,
          pathname: location.pathname,
        });
        frame.src = 'https://${props.mediaDomain}/gtm/jail?id=${props.googleTagManagerId}';
        document.body.appendChild(frame);
      }
    </script>
  `;

  return <div dangerouslySetInnerHTML={ { __html: script } } />;
};

GoogleTagManager.propTypes = {
  nonce: T.string.isRequired,
  mediaDomain: T.string.isRequired,
  googleTagManagerId: T.string.isRequired,
  subredditName: T.string,
};

export default GoogleTagManager;
