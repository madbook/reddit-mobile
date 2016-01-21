const GENERIC_MESSAGE = 'There was a problem';

export default function extractErrorMsg(error) {
  if (!error) { return GENERIC_MESSAGE; }
  
  if (error.errors && error.errors.length) {
    return error.errors[0][1] || GENERIC_MESSAGE;
  } else if (error.message) {
    return error.message || GENERIC_MESSAGE;
  }
  
  return GENERIC_MESSAGE;
}
