## Requirements

* NodeJS v4.0+
* NPM v3.10+
* macOS or Linux (not tested on Windows)

## Quick start

We use NPM scripts for all development related tasks.

### git

The main git branch is **2X**

We use rebasing in order to avoid merge commits.

#### Hooks

  We have pre-commit/push hooks in the `hooks` directory to help enforce our linting rules and tests. Developers are highly encouraged to use them.

### Configure your dev envirnoment

We use a shell script to run the app so we can define needed environment variables. By convention we call it `start.sh`. This file is already in our `.gitignore`.

`cp start.sh.example start.sh`
`chmod u+wx start.sh`

Make sure to update the script with the appropriate secrets and other necessary values.

### Install

`npm install`

### Build/watch

*watch* - `npm run watch`
*build* - `npm run build`

### running the app

Instead of running the npm script that starts the server make sure to use your `start.sh` with the appropriate keys so you can log in.

`./start.sh`
