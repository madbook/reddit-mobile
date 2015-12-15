/*eslint max-len: 0*/
import React from 'react';
import SVG from '../../components/SVG';

const _EYE_RADIUS = 1.142124;
const _EYE_HEIGHT = 11.1461885;
const _MOUTH_STROKE = 0.55;
const _DINGLEBERRY_CENTER = {x: 14.753913, y: 4.293349};
const _ELBOW = {x: 10.859162, y: 3.443727};
const _ROOT = {x: 9.995599, y: 7.339012};
const _LEFT_EYE_X = 7.482927;
const _RIGHT_EYE_X = 12.508015;
const _EAR_HEIGHT = 9.6234565;
const _EAR_RADIUS = 1.523042;
const _BLUE = '#24A0ED';
const _GREEN = '#7CD344';

function SnooIcon (props) {
  const rainbow = props.rainbow;
  let background;

  if (rainbow) {
    background = (
      <g>
        <path fill="#FF4500" d="M2.546533,3.332222h14.906933C15.622401,1.292902,12.961612,0,10,0 S4.377599,1.292902,2.546533,3.332222z"/>
        <path fill="#FF8717" d="M0.569084,6.671109h18.861832c-0.439024-1.249583-1.11655-2.36921-1.977449-3.338887H2.546533 C1.685634,4.301899,1.008108,5.421526,0.569084,6.671109z"/>
        <path fill="#FFD635" d="M0.569084,6.671109C0.200573,7.710763,0,8.831594,0,10h20 c0-1.168406-0.200573-2.289237-0.569084-3.328891H0.569084z"/>
        <path fill={ _GREEN } d="M0.569084,13.32889h18.861832C19.799427,12.289237,20,11.168405,20,10H0 C0,11.168405,0.200573,12.289237,0.569084,13.32889z"/>
        <path fill={ _BLUE } d="M17.453466,16.667776c0.860899-0.969676,1.538425-2.089303,1.977449-3.338886H0.569084 c0.439025,1.249583,1.11655,2.36921,1.977449,3.338886H17.453466z"/>
        <path fill="#6161FF" d="M17.453466,16.667776H2.546533C4.377599,18.707098,7.038388,20,10,20 S15.622401,18.707098,17.453466,16.667776z"/>
      </g>
    );
  } else {
    background = (
      <circle className='SVG-fill' cx={ SVG.ICON_SIZE / 2 } cy={ SVG.ICON_SIZE / 2 } r={ SVG.ICON_SIZE / 2 }/>
    );
  }

  return (
    <SVG className='SVG-icon SnooIcon' fallbackIcon='icon-snoo-circled'>
      { background }
      <g>
        <path className='SVG-fill-bg' d='M16.086926,11.717036c0-2.414056-2.732691-4.378024-6.091592-4.378024 c-3.358627,0-6.091061,1.963968-6.091061,4.378024c0,2.414167,2.732434,4.378257,6.091061,4.378257 C13.354235,16.095293,16.086926,14.131204,16.086926,11.717036z'/>
        <circle className='SVG-fill-bg' cx={ _DINGLEBERRY_CENTER.x } cy={ _DINGLEBERRY_CENTER.y } r={ _EYE_RADIUS }/>
        <g fill='none' className='SVG-stroke-bg' strokeWidth='0.532991' strokeLinecap='round'>
          <line x1={ _ELBOW.x } y1={ _ELBOW.y } x2={ _DINGLEBERRY_CENTER.x } y2={ _DINGLEBERRY_CENTER.y }/>
          <line x1={ _ELBOW.x } y1={ _ELBOW.y } x2={ _ROOT.x } y2={ _ROOT.y }/>
        </g>
        <circle className='SVG-fill-bg' cx='4.6658' cy={ _EAR_HEIGHT } r={ _EAR_RADIUS }/>
        <circle className='SVG-fill-bg' cx='15.325253' cy={ _EAR_HEIGHT } r={ _EAR_RADIUS }/>
        <g className={ rainbow ? '' : 'SVG-fill' } fill={ rainbow ? _GREEN : '' }>
          <circle cx={ _LEFT_EYE_X } cy={ _EYE_HEIGHT } r={ _EYE_RADIUS }/>
          <circle cx={ _RIGHT_EYE_X } cy={ _EYE_HEIGHT } r={ _EYE_RADIUS }/>
        </g>
        <rect x={ _LEFT_EYE_X - _EYE_RADIUS } y={ _EYE_HEIGHT - _EYE_RADIUS } className='SVG-fill-bg' width={ _RIGHT_EYE_X - _LEFT_EYE_X + _EYE_RADIUS * 2 } height='0'/>
        <rect x={ _LEFT_EYE_X - _EYE_RADIUS } y={ _EYE_HEIGHT + _EYE_RADIUS } className='SVG-fill-bg' width={ _RIGHT_EYE_X - _LEFT_EYE_X + _EYE_RADIUS * 2 } height='0'/>
        <path fill='none' className={ rainbow ? '' : 'SVG-stroke mouth' } stroke={ rainbow ? _BLUE : '' } strokeWidth={ _MOUTH_STROKE } strokeLinecap='round' d='M7.652076,13.657867c0.460886,0.460942,1.363549,0.705836,2.347492,0.705836 c1.016057,0,1.886656-0.244787,2.348355-0.705836'/>
      </g>
    </SVG>
  );
}

SnooIcon.defaultProps = {
  played: false,
  rainbow: false,
};

SnooIcon.propTypes = {
  played: React.PropTypes.bool,
  rainbow: React.PropTypes.bool,
};

export default SnooIcon;
