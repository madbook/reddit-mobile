/*eslint no-unused-vars: 0 */
import blessed from 'blessed';
import contrib from 'blessed-contrib';
import moment from 'moment';
import usage from 'usage';
import filesize from 'filesize';
import fs from 'fs';
import url from 'url';
import throttle from 'lodash/function/throttle';

import superagent from 'superagent';

import {exec} from 'child_process';

import {EventEmitter} from 'events';

class Console {
  constructor (config) {
    this.config = config;
    this.emitter = new EventEmitter();
    this.servers = [];

    this.loadStats = this.loadStats.bind(this);
    this.bounceStats = this.bounceStats.bind(this);

    this.logStream = fs.createWriteStream('./reddit-mobile.log', {
      flags: 'w',
      encoding: 'utf8',
    });

    this.log = this.log.bind(this);
    this.warn = this.warn.bind(this);
    this.error = this.error.bind(this);
    this.logRequest = this.logRequest.bind(this);
  }

  log () {
    const message = [...arguments].join('\t');
    this.emitter.emit('log', Date.now(), message, 'log');
  }

  warn () {
    const message = [...arguments].join('\t');
    this.emitter.emit('log', Date.now(), message, 'warn');
  }

  error () {
    const message = [...arguments].join('\t');
    this.emitter.emit('log', Date.now(), message, 'error');
  }

  updateActiveRequests (requests) {
    this.emitter.emit('activeRequests', requests);
  }

  loadStats(cb) {
    if (!this.processes) {
      return;
    }

    Promise.all(this.processes.map((pid) => {
      return new Promise((resolve, reject) => {
        usage.lookup(pid, (err, res) => {
          if (res) {
            return resolve(res);
          }

          reject(err);
        });
      });
    })).then((data) => {
      const stats = data.map((s, i) => {
        return [
          this.processes[i].toString(),
          filesize(s.memory),
          `${s.cpu.toString()}%`,
        ];
      });

      this.emitter.emit('stats', stats);
      cb();
    });
  }

  bounceStats() {
    setTimeout(() => {
      this.loadStats(this.bounceStats);
    }, 250);
  }

  formatLog (timestamp, data) {
    const time = moment(timestamp).format('HH:mm:ss.SS');
    return `{#666666-fg}[${time}]{/} ${data}`;
  }

  start () {
    this.buildScreen();
    this.bounceStats();
  }

  buildScreen () {
    const screen = blessed.Screen({
      autoPadding: true,
      smartCSR: true,
      title: 'reddit mobile web',
      dockBorders: true,
    });

    this.screen = screen;

    const grid = new contrib.grid({
      rows: 13,
      cols: 12,
      screen,
    });

    // Set this, so if it fails, we can get log output
    this.logScreen = this.buildLog(grid);

    const apiLog = this.buildAPILog(grid);
    const activeRequests = this.buildActiveRequests(grid);
    const map = this.buildMap(grid);
    const form = this.buildForm(grid);

    const status = this.buildStatus(grid);

    screen.key(['escape', 'q', 'C-c'], function() {
      process.exit(0);
    });

    screen.render();
    return screen;
  }

  buildLog (grid) {
    const log = grid.set(0, 0, 6, 7, blessed.log, {
      fg: 'white',
      selectedFg: 'white',
      label: 'Server log',
      scrollable: true,
      tags: true,
    });

    this.emitter.on('log', (timestamp, data, type='info') => {
      const message = `${this.formatLog(timestamp, data)}`;

      if (type === 'warn') {
        log.log(`{yellow-fg}${message}{/}`);
      } else if (type === 'error') {
        log.log(`{red-fg}${message}{/}`);
      } else {
        log.log(message);
      }

      log.render();

      if (this.logStream) {
        this.logStream.write(`${message}\n`);
      }
    });

    return log;
  }

  buildAPILog (grid) {
    const apiLog = grid.set(6, 0, 6, 7, contrib.log, {
      tags: true,
      fg: 'white',
      selectedFg: 'white',
      label: 'API Reqs',
    });

    this.emitter.on('logRequest', (data) => {
      apiLog.log(data);
    });

    return apiLog;
  }

  buildMap (grid) {
    const map = grid.set(9, 7, 3, 5, contrib.map, { });

    const colors = ['white', 'green'];
    let current = 0;

    const blink = function() {
      setTimeout(function() {
        map.addMarker({
          'lat': '39.04',
          'lon' : '-77.48',
          color: colors[current % 2],
          char: 'X',
        });

        current++;

        map.addMarker({
          'lat': '37.78',
          'lon' : '-122.41',
          color: colors[current % 2],
          char: 'X',
        });

        blink();
      }, 1000);
    };

    blink();

    return map;
  }

  buildForm (grid) {
    const cons = this;
    const defaultPrefix = this.config.origin;

    function submit (data) {
      console.log('submitted', data);
    }

    const form = grid.set(12, 0, 1, 12, blessed.form, {
      label: 'Test path ([ENTER] to submit)',
      clickable: true,
    });

    const input = blessed.textbox({
      inputOnFocus: true,
      keys: true,
      clickable: true,
      value: defaultPrefix,
      width: '75%',
    });

    input.key('enter', function () {
      const uri = this.getValue();
      cons.log(`Beginning test of ${uri}`);

      superagent
        .get(uri)
        .end(function(err, res) {
          if (err || (res && !res.ok)) {
            const status = res ? res.status : undefined;
            cons.log(`${err || 'TEST FAIL'}: ${status}`);
          } else {
            cons.log('Test succeeded');
          }

          const bareURI = uri.replace(defaultPrefix, '');
          const filename = `testlog-${bareURI.replace(/[^a-zA-Z\d\s]/g,'-')}-${Date.now()}.log`;
          fs.writeFile(filename, err || res.text);

          cons.log(`Test results written to ${filename}.`);

          input.value = defaultPrefix;
          input.focus();
        });
    });

    form.append(input);
    input.focus();

    function clearLogs () {
      console.log('CLEARING TEST LOGS');
      exec('rm testlog*');
      console.log('TEST LOGS CLEARED');
    }

    const button = blessed.button({
      mouse: true,
      keys: true,
      left: '74%',
      width: '25%',
      name: 'clearlogs',
      content: '{center}clear logs{/}',
      tags: true,
      style: {
        fg: 'white',
        bg: 'blue',
        focus: {
          bg: 'red',
        },
        hover: {
          bg: 'red',
        },
      },
    });

    button.on('press', clearLogs);
    form.append(button);
  }

  logRequest ([state, method, uri, options, status, err, duration]) {
    const message = [];
    const parsedUri = url.parse(uri);
    const api = `[api]${parsedUri.path}`;

    // requsest has completed if there's a status
    if (status) {
      if (parseInt(status / 100) === 2) {
        message.push('{green-fg}');
        message.push(status);
        message.push(`(${duration}ms)`);
        message.push(api);
        message.push('{/}');
      } else if (parseInt(status / 100) === 4) {
        message.push('{yellow-fg}');
        message.push(status);
        message.push(`(${duration}ms)`);
        message.push(api);
        message.push('{/}');
      } else {
        message.push('{bold}{red-fg}');
        message.push(status);
        message.push(`(${duration}ms)`);
        message.push(api);
        message.push('{/}');
      }
    } else {
      message.push('{blue-fg}');
      message.push(state);
      message.push(api);
      message.push('{/}');
    }

    this.emitter.emit('logRequest', message.join(' '));
  }

  buildStatus (grid) {
    const headers = ['Worker', 'Memory', 'CPU'];

    const status = grid.set(0, 7, 3, 5, contrib.table, {
      clickable: true,
      interactive: true,
      keys: true,
      fg: 'white',
      label: 'Active Processes',
      columnSpacing: 6,
      columnWidth: [
        7,
        10,
        10,
      ],
    });

    status.setData({
      headers,
      data: [],
    });

    this.emitter.on('stats', (data) => {
      status.setData({
        headers,
        data,
      });

      this.screen.render();
    });

    return status;
  }

  buildActiveRequests (grid) {
    const activeRequests = grid.set(3, 7, 6, 5, contrib.sparkline, {
      label: 'Active requests queued',
      tags: true,
      style: {
        fg: 'blue',
      },
    });

    const maxRequests = {};

    this.emitter.on('activeRequests', (requests) => {
      this.activeRequests = requests;
    });

    this.emitter.on('activeRequests', throttle(function(requests) {
      const titles = Object.keys(requests).map((k) => {
        const latest = requests[k][requests[k].length - 1];

        if (!maxRequests[k] || latest > maxRequests[k]) {
          maxRequests[k] = latest;
        }

        return `${k} [${latest}] (M: ${maxRequests[k]})`;
      });

      activeRequests.setData(
        titles,
        Object.values(requests)
      );
    }, 500));
  }

  setProcesses (processes) {
    this.processes = processes;
  }

  failProcess (pid) {
    const i = this.processes.indexOf(pid);

    if (i !== -1) {
      this.processes = this.processes.splice(i, 1);
    }
  }

  addProcess (pid) {
    this.processes.push(pid);
  }
}

export default Console;
