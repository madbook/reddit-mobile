import './Input.less';
import React from 'react';

import cx from 'lib/classNames';

const T = React.PropTypes;

function LoginInput(props) {
  const { showTopBorder, name, type, placeholder, error, children } = props;
  const inputClasses = cx('LoginInput__input', {
    'error': !!error,
    'show-top': showTopBorder,
  });
  const errorMessage = error ? <p className='LoginInput__error-text'>{ error }</p> : null;

  return (
    <div>
      <div className='LoginInput'>
        <label htmlFor={ name } className='hidden'/>
        <input
          id={ name }
          name={ name }
          type={ type }
          className={ inputClasses }
          placeholder={ placeholder }
        />
        { children }
      </div>
      { errorMessage }
    </div>
  );
}

LoginInput.propTypes = {
  name: T.string.isRequired,
  type: T.string,
  placeholder: T.string.isRequired,
  showTopBorder: T.bool,
  error: T.string,
};

LoginInput.defaultProps = {
  type: 'text',
  showTopBorder: false,
};

export default LoginInput;
