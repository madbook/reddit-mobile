const loggedErrorsByMessage = {};

function warnOfError() {
  if (console && console.error) {
    console.error(...arguments);
  }
}

function checkProperty(propTypes, propName, props, className) {
  let error;
  try {
    error = propTypes[propName](props, propName, className, 'prop');
  } catch (exception) {
    error = exception;
  }

  return error;
}

export default function validatePropTypes(propTypes, props, className) {
  for (const propName in propTypes) {
    if (!propTypes.hasOwnProperty(propName)) { continue; }

    if (typeof propTypes[propName] !== 'function') {
      warnOfError(`${className}::PropTypes[${propName}] is not a property validator`);
      continue;
    }

    const error = checkProperty(propTypes, propName, props, className);

    if (error instanceof Error && !(error.message in loggedErrorsByMessage)) {
      warnOfError(`Warning: Manual PropTypes Failed propType: ${error.message}`);
      loggedErrorsByMessage[error.message] = true;
    }
  }
}
