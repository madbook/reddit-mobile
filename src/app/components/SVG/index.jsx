import React from 'react';

const T = React.PropTypes;

const _NS = 'http://www.w3.org/2000/svg';
const ICON_SIZE = 20;

export default function SVG(props) {
  const { move, out, className, children, width, height } = props;
  return (
    <svg
      className={ className }
      version='1.1'
      xmlns={ _NS }
      x='0px'
      y='0px'
      width={ `${width}px` }
      height={ `${height}px` }
      viewBox={ `0 0 ${width} ${height}` }
      onMouseMove={ move }
      onMouseLeave={ out }
    >
      { children }
    </svg>
  );
}

SVG.propTypes = {
  move: T.func,
  out: T.func,
  className: T.string,
  width: T.number,
  height: T.number,
};

SVG.defaultProps = {
  width: ICON_SIZE,
  height: ICON_SIZE,
};
