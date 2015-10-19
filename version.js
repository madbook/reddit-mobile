var semver = require('semver');
var packageJSON = require('./package.json');

if (!semver.satisfies(process.version, packageJSON.engines.node)) {
  throw('Please use node ' + packageJSON.engines.node + ', currently using ' + process.version);
}
