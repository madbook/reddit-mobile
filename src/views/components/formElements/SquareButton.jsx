import React from 'react';

const T = React.PropTypes;

function content(content, fontSize) {
  const style = {
    fontSize,
    marginTop: -(1.5 * fontSize) / 2,
  };

  return <div className='SquareButton__content' style={ style }>{ content }</div>;
}

function SquareButton(props) {
  let cls = 'SquareButton';
  if (!props.enabled) { cls += ' m-disabled'; }

  function fireClick(e) {
    if (props.enabled) { props.onClick(e); }
  }

  return (
    <button
      type={ props.type }
      className={ cls }
      onClick={ fireClick }
    >
      { content(props.text, props.fontSize) }
    </button>
  );
}

SquareButton.propTypes = {
  text: T.string.isRequired,
  type: T.string,
  enabled: T.bool,
  onClick: T.func,
  fontSize: T.number,
};

SquareButton.defaultProps = {
  type: 'button',
  enabled: true,
  fontSize: 12,
  onClick: () => {},
};

export default SquareButton;
