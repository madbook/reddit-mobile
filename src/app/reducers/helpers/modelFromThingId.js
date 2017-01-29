// a thing id is a model's id with the t#_prefix, this helper makes it easier
// to pull the model in question out of state from just the thing id.
import { thingType } from 'apiClient/models/thingTypes';

export default function(thingId, state) {
  const type = thingType(thingId);

  // this assumes that all model types will be stored in state in their plural form.
  // e.g. models of type 'post' will be stored in state as 'posts'
  const models = state[`${type}s`];
  return models[thingId];
}
