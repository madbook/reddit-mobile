import React from 'react';

const T = React.PropTypes;

function TextField(props) {
  return (
    <textarea
      className='TextField'
      onChange={ props.onChange }
      value={ props.value }
    />
  );
}

TextField.propTypes = {
  value: T.string,
  placeholder: T.string,
  onChange: T.func,
};

TextField.defaultProps = {
  value: '',
  placeholder: '',
  onChange: () => {},
};

export default TextField;
