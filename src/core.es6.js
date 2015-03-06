// Export the plugin interface (right now, just a register function that passes
// the app instance into a route builder.)
import routes from './routes';

var core = {};

core.register = function(app, server) {
  routes(app);
}

export default core;
