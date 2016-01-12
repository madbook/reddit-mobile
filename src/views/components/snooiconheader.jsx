import React from 'react';

const T = React.PropTypes;

function SnooIconHeader(props) {
  return (
    <div className='SnooIconHeader__wrapper'>
      <button className='SnooIconHeader__button' onClick={ props.close }>&times;</button>
      <div className='SnooIconHeader__icon-box'>
        <span className='icon-snoo-circled orangered icon-xxl' />
        <p className='SnooIconHeader__title'>{ props.title }</p>
      </div>
    </div>
  );
}

SnooIconHeader.propTypes = {
  close: T.func.isRequired,
  title: T.string.isRequired,
};

export default SnooIconHeader;
