// We need to try preventing passwords from getting logged, build a set
// of how we imagine they'll be represented in JSON or api call bodies
const PASSWORD_KEYS = new Set(['password', 'passwd', 'pass', 'pw']);

export default function(data) {
  // JSON.stringify's 2nd argument is a replacer function that lets
  // you control how data is stringified.
  // Try really hard to prevent leaking user info
  return JSON.stringify(data, (key, value) => {
    // JSON.stringify's 2nd argument is a replacer function that lets
    // you control how data is stringified.
    // Try really hard to prevent leaking user info
    if (PASSWORD_KEYS.has(key)) {
      return '<REDACTED />';
    }

    return value;
  });
}
