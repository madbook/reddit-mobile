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

    cp start.sh.example start.sh
    chmod u+wx start.sh
    vim start.sh  # Add secret keys for your reddit install

`start.sh` is automatically ignored by git. DO NOT EDIT `start.sh.example`

After creating `start.sh`, you can start your dev server by calling `./start.sh` from the command line.

