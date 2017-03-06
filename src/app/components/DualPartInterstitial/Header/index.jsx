import './styles.less';

import React from 'react';
import TopNav from 'app/components/TopNav';

const TransparentOverlay = props => {
  return (
    <div className='TransparentOverlay'>
      <div className='TransparentOverlay__overlay'></div>
      <div className='TransparentOverlay__childContainer'>
        { props.children }
      </div>
    </div>
  );
};

export default function DualPartInterstitialHeader(props) {
  const { children} = props;
  return (
    <div className='DualPartInterstitialHeader plain'>
      <TransparentOverlay>
        <TopNav />
        { children }
      </TransparentOverlay>
    </div>
  );
}
