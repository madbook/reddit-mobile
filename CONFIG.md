Configuration
=============

This is a list of the environment variables you can set to make things work as
you might expect.

Shared Config
-------------

These configuration options are shared between the server and client.

* `HTTPS` (default 'true') - set this to 'false' if you are not running on
  https. Mostly affects cookie options.
* `HTTPS_PROXY` (default 'true') - this should be set to 'true' if you are
  using SSL termination (like from an ELB), which helps SSL cookies function.
* `SWITCHAROO_DEBUG` (default 'true') - log errors to console.
* `MINIFY_ASSETS` (default 'true') - use minified assets.
* `LIVERELOAD` (default 'true') - enable livereload (for use with `npm run watch`).
* `STATIC_BASE` (default '') - set the base url for static assets. Useufl if
  you upload static assets to an S3 bucket.
* `ORIGIN` (default 'http://localhost:4444') - your server url. Used when
  fully qualified urls are necessary.
* `PORT` (default 4444) - the port you want to run on. (Make sure to update
  `ORIGIN` too.)
* `NODE_ENV` (default 'development') - sets node logging levels.
* `NON_AUTH_API_ORIGIN` (default 'https://ssl.reddit.com') - the url to hit for
  unauthenticated requests.
* `AUTH_API_ORIGIN` (default 'https://oauth.reddit.com') -  the url to hit for
  requests that include oauth tokens.
* `REDDIT` (default 'https://www.reddit.com') - the base url for reddit pages.
* `LOGIN_PATH` (default '/oauth2/login') - use either the oauth redirect, or if
  you are a trusted application, set to '/login' to use password authentication.
* `GOOGLE_ANALYTICS_ID` (default null) - if you want to use GA, add your id.
* `GOOGLE_TAG_MANAGER_ID` (default null) - if you want to use GTM, add your container id.
* `ADBLOCK_TEST_CLASSNAME` (default 'ad adsense-ad googad gemini-ad openx') - class used
  to test for the presence of an adblocker.
* `ADS_PATH` (default  'https://www.reddit.com/api/request_promo.json') - the
  url to hit to load ads. *Set to empty if you do not wish to load ads.*
* `TRACKER_KEY` (default null) - the key to use to send events to the [event collector](https://github.com/reddit/event-collector)
* `TRACKER_ENDPOINT` (default null) - the url to send events to the [event collector](https://github.com/reddit/event-collector)
* `TRACKER_CLIENT_NAME` (default null) - the name of the client to send to the [event collector](https://github.com/reddit/event-collector)

Secret Server Config
--------------------

These options are never shared with the client.

* `OAUTH_CLIENT_ID` - your oauth client id.
* `OAUTH_SECRET` - take a wild guess.
* `SECRET_OAUTH_CLIENT_ID` and `SECRET_OAUTH_SECRET` - if you have a
  privileged client that can use the password authentication flow (unlikely
  unless you host your own reddit instance), this is what you use for that flow.
* `SERVER_SIGNED_COOKIE_KEY` - you should set this to something long and
  complicated, so you can protect your cookies.
* `PROCESSES` (defaults to number of cpu cores) - how many node processes
  to start and run with node clustering.
* `API_HEADERS` - semicolon-delimited list of colon-delimited
  key:value pairs of headers the server should send to the api. For example:
  `ratelimiting:off;moose:majestic`
* `API_PASS_THROUGH_HEADERS` - semicolon-delimited whitelist of headers (lowercase)
  that the server should send to the api during server rendering. For example:
  `accept-language;other-thing`. (user-agent is sent automatically.)
* `STATS_URL` - a url that tracking data should be sent to (such as page
  load times.) reddit uses a [metron](https://github.com/reddit/metron) instance
* `MEDIA_DOMAIN` – a cookieless domain used for non-trusted code.
  to send page load timings to statsd, for instance.
* `ACTION_NAME_SECRET` - a secret key used to sign data send to the stats
  server, as set above.
* `EXPERIMENTS` - semicolon-delimited list of name:percentage experiments that
  should be enabled (see server.jsx for examples of running experiments.)
