export const RECEIEVED_API_RESPONSE = 'API_RESPONSE__RECEIVED_RESPONSE';
export const receivedResponse = apiResponse => ({
  type: RECEIEVED_API_RESPONSE,
  apiResponse,
});

export const UPDATED_MODEL = 'UPDATED_MODEL';
export const updatedModel = (model, kind) => ({
  type: UPDATED_MODEL,
  kind,
  model,
});
