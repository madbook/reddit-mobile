import React from 'react';

const T = React.PropTypes;

function Input(props) {
  const { showTopBorder, name, type, placeholder,
          onChange, error, children, value } = props;
  const showTop = showTopBorder ? 'show-top' : '';

  let errorClass = '';
  let errorMessage;
  if (error) {
    errorClass = 'error';
    errorMessage = (
      <p className='minimalInput__error-text'>{ error }</p>
    );
  }

  return (
    <div>
      <div className='minimalInput'>
        <label htmlFor={ name } className='hidden'/>
        <input
          id={ name }
          name={ name }
          type={ type }
          value={ value }
          className={ `minimalInput__input ${showTop} ${errorClass}` }
          placeholder={ placeholder }
          onChange={ onChange }
        />
        { children }
      </div>
      { errorMessage }
    </div>
  );
}

Input.propTypes = {
  onChange: T.func.isRequired,
  error:T.string,
  showTopBorder: T.bool,
  value: T.string.isRequired,
  name: T.string.isRequired,
  type: T.string,
  placeholder: T.string.isRequired,
};

Input.defaultProps = {
  type: 'text',
  showTopBorder: false,
};

export default Input;
