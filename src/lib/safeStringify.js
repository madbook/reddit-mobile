/**
 * Escape a JSON blob via unicode escape sequences - escapes &, <, and >
 *
 * @param {Object} data - the data object we want to JSONize
 * @returns {String} - the safe JSON string
*/
export default data => {
  return JSON.stringify(data)
    .replace(/&/g, '\\u0026')
    .replace(/</g, '\\u003C')
    .replace(/>/g, '\\u003E');
};
