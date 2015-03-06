// This file is another configuration-type file. We need to reference `import`
// statements directly so that browserify can find all of the plugins for
// client-side compilation.

import ads from 'reddit-mobile-plugin-ads';
import metrics from 'reddit-mobile-plugin-metrics';

var plugins = {
  ads: ads,
  metrics: metrics,
}

export default plugins;
