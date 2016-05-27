export const RECEIVED_API_RESPONSE = 'API_RESPONSE__RECEIVED_RESPONSE';
export const receivedResponse = apiResponse => ({
  type: RECEIVED_API_RESPONSE,
  apiResponse,
});

export const UPDATED_MODEL = 'UPDATED_MODEL';
export const updatedModel = (model, kind) => ({
  type: UPDATED_MODEL,
  kind,
  model,
});

export const NEW_MODEL = 'NEW_MODEL';
export const newModel = (model, kind) => ({
  type: NEW_MODEL,
  kind,
  model,
});
