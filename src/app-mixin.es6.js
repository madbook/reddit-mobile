import { mutate } from 'react-mutator';
import { EventEmitter } from 'events';

// The base routes
import routes from './routes';

// Import the api instance; we're going to share an instance between the
// plugins.
import { v1 as V1Api } from 'snoode';

function mixin (App) {
  class MixedInApp extends App {
    constructor (config={}) {
      super(config)

      this.mutators = config.mutators || {};

      // Set up two APIs (until we get non-authed oauth working).
      this.nonAuthAPI = new V1Api({
        userAgent: config.userAgent,
        origin: config.nonAuthAPIOrigin,
      });

      this.oauthAPI = new V1Api({
        userAgent: config.userAgent,
        origin: config.authAPIOrigin,
      });

      routes(this);
    }

    // Allow plugins to register mutators that change how React elements render.
    registerMutators (elementName, mutators) {
      this.mutators[elementName] = this.mutators[elementName] || [];
      this.mutators[elementName] = this.mutators[elementName].concat(mutators);
    }

    // React elements in plugins should call `mutate` as a response to their
    // Factory methods so that registered mutators can wrap the elements.
    mutate (elementName, component) {
      var args = this.mutators[elementName];

      if (args && args.length) {
        args.splice(0, 0, component);
        return mutate.apply(component, args);
      }

      return component;
    }

    // Return the proper API based on session information.
    V1Api (session) {
      if (session.token){
        return this.oauthAPI;
      }

      return this.nonAuthAPI;
    }
  }

  return MixedInApp;
}

export default mixin;
