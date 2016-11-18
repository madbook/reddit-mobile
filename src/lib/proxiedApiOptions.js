/**
 * Updates the default server side api options with usefull debugging info
 * from the client request context.
 * @module lib/proxiedApiOptions
 * @param   {object} ctx - The koa request context object we want to extract headers from
 * @param   {object} apiOptions - The base api options to pass to node-api-client
 * @returns {object} The updated api options with useful debugging info attached
 */

import config from 'config';

export default function proxiedApiOptions(ctx, apiOptions) {
  const proxiedHeaders = {};

  config.apiPassThroughHeaders.forEach(key => {
    const value = ctx.headers[key];
    if (value) {
      proxiedHeaders[key] = value;
    }
  });

  const defaultHeaders = config.apiHeaders;

  return {
    ...apiOptions,
    headers: {
      ...(apiOptions.headers || {}),
      ...defaultHeaders,
      ...proxiedHeaders,
    },
  };
}
