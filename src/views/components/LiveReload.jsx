import React from 'react';

function LiveReload ({ nonce }) {
  return (
    <script src="//localhost:35729/livereload.js?snipver=1" nonce={ nonce }></script>
  );
}

export default LiveReload;
