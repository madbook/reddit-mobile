import React from 'react';

const T = React.PropTypes;

export default function DropdownRow(props) {
  if (props.href) {
    return (
      <a
        className='DropdownRow'
        href={ props.href }
        onClick={ props.onClick }
      >
        { props.children }
      </a>
    );
  }

  return (
    <div
      className='DropdownRow'
      onClick={ props.onClick }
    >
      { props.children }
    </div>
  );
}

DropdownRow.propTypes = {
  href: T.string,
  onClick: T.func,
};
