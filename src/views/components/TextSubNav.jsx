import React from 'react';

function TextSubNav (props) {
  return (
    <nav className='TextSubNav shadow'>
      <ul className='TextSubNav-ul list-unstyled'>
        { props.children }
      </ul>
    </nav>
  );
}

export default TextSubNav;
