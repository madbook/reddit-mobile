import './Input.less';
import React from 'react';

import cx from 'lib/classNames';

const T = React.PropTypes;

function LoginInput(props) {
  const { showTopBorder, name, type, placeholder, error, onChange, value, children } = props;
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
          className={ inputClasses }
          id={ name }
          onChange={ onChange }
          name={ name }
          placeholder={ placeholder }
          type={ type }
          value={ value }
        />
        { children }
      </div>
      { errorMessage }
    </div>
  );
}

LoginInput.propTypes = {
  error: T.string,
  name: T.string.isRequired,
  onChange: T.func,
  placeholder: T.string.isRequired,
  showTopBorder: T.bool,
  type: T.string,
  value: T.string.isRequired,
};

LoginInput.defaultProps = {
  showTopBorder: false,
  type: 'text',
};

export default LoginInput;
