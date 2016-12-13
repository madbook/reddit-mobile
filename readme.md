### Quick start

1. Install npm dependencies:
  `git submodule init && git submodule update && npm install`
2. Build:
  `npm run build` (optionally watch for updates with `npm run watch`)
3. Run:
  * dev: `npm run dev-server`
  * production: `npm run server`
4. Visit http://localhost:4444/

### Configuring your dev environment

Create a file in the root called `start.sh` and make it executable `chmod +x start.sh`.
This file is automatically ignore by git and you can use it to start the server instead
of `npm run`.

#### Example

```sh
#!/bin/bash
GOOGLE_ANALYTICS_ID='UA-XXXXXX-1' \
LIVERELOAD=true \
DEBUG_LEVEL='info' \
OAUTH_CLIENT_ID=XXXXXXXXX \
SECRET_OAUTH_CLIENT_ID=XXXXXXXXX \
OAUTH_SECRET=XXXXXXXXX \
PROCESSES=2 \
API_PASS_THROUGH_HEADERS='accept-language' \
LOGIN_PATH="/login" \
MINIFY_ASSETS="false" \
STATSD_DEBUG="true" \
npm run dev-server
```