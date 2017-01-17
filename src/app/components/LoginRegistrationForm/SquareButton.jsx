import './SquareButton.less';
import React from 'react';

import cx from 'lib/classNames';

const T = React.PropTypes;

function SquareButton(props) {
  const { enabled, modifier } = props;
  const cls = cx('SquareButton', { 'm-disabled': !enabled, [modifier]: modifier.length });
  function fireClick(e) {
    if (props.enabled) { props.onClick(e); }
  }

  return (
    <button
      type={ props.type }
      className={ cls }
      onClick={ fireClick }
    >
      <div className='SquareButton__content'>
        { props.text }
      </div>
    </button>
  );
}

SquareButton.propTypes = {
  text: T.string.isRequired,
  type: T.string,
  enabled: T.bool,
  modifier: T.string,
  onClick: T.func,
  fontSize: T.number,
};

SquareButton.defaultProps = {
  type: 'button',
  enabled: true,
  modifier: '',
  fontSize: 12,
  onClick: () => {},
};

export default SquareButton;
