import React from 'react';

const T = React.PropTypes;

function GoogleTagManager (props) {
  const script = `
    <script nonce=${props.nonce}>
      if (!window.DO_NOT_TRACK) {
        var frame = document.createElement('iframe');

        frame.style.display = 'none';
        frame.referrer = 'no-referrer';
        frame.id = 'gtm-jail';
        frame.name = JSON.stringify({
          subreddit: '${props.subredditName || ''}',
          origin: location.origin,
          pathname: location.pathname,
        });
        frame.src = '//${props.mediaDomain}/gtm/jail?id=${props.googleTagManagerId}';
        document.body.appendChild(frame);
      }
    </script>
  `;

  return <div dangerouslySetInnerHTML={ { __html: script } } />;
}

GoogleTagManager.propTypes = {
  nonce: T.string.isRequired,
  mediaDomain: T.string.isRequired,
  googleTagManagerId: T.string.isRequired,
  subredditName: T.string,
};

export default GoogleTagManager;
