import React from 'react';

const _NS = 'http://www.w3.org/2000/svg';


function SVG (props) {
  const width = props.width || SVG.ICON_SIZE;
  const height = props.height || SVG.ICON_SIZE;

  if (SVG.ENABLED) {
    const move = props.move;
    const out = props.out;

    return (
      <svg
        className={ props.className }
        version='1.1'
        xmlns={ _NS }
        x='0px'
        y='0px'
        width={ width+'px' }
        height={ height+'px' }
        viewBox={ '0 0 '+width+' '+height }
        onMouseMove={ move }
        onMouseLeave={ out }
      >
        { props.children }
      </svg>
    );
  }

  const fallbackIcon = props.fallbackIcon;
  if (fallbackIcon) {
    return <figure className={ props.className + ' ' + fallbackIcon }/>;
  }

  const fallbackText = props.fallbackText;
  if (fallbackText) {
    return <span className='fallbackText'>{ fallbackText }</span>;
  }

  const fallbackImg = props.fallbackImg;
  if (fallbackImg) {
    return <img className='fallbackImg' src={ fallbackImg } width={ width } height={ height }/>;
  }

  const Fallback = props.fallbackComponent;
  if (Fallback) {
    return <Fallback/>;
  }

  return <span className='placeholder'/>;
}

SVG.ENABLED = typeof document !== 'undefined' &&
              (!!document.createElementNS && !!document.createElementNS(_NS, 'svg').createSVGRect);
SVG.ICON_SIZE = 20;

export default SVG;
