import './styles.less';

import React from 'react';
import { connect } from 'react-redux';

import TopNav from 'app/components/TopNav';
import CompactSubreddit from 'app/components/CompactSubreddit';
import ThumbnailGrid from 'app/components/ThumbnailGrid';
import IPhoneAppPreview from 'app/components/IPhoneAppPreview';
import { interstitialExperimentSelector } from 'app/selectors/interstitialExperiment';


const TransparentOverlay = props => {
  const { noColor } = props;
  const overlayModifier = noColor ? 'no-color' : '';
  return (
    <div className='TransparentOverlay'>
      <div className={ `TransparentOverlay__overlay ${overlayModifier}` }></div>
      <div className='TransparentOverlay__childContainer'>
        { props.children }
      </div>
    </div>
  );
};

const DualPartInterstitialHeader = props => {
  const {
    showTransparency,
    showEmbeddedApp,
    showSubredditPosts,
    showStaticAppPreview,
    showSpeedAppPreview,
    showGifAppPreview,
    showThumbnailGrid,
    children,
  } = props;

  let innerContent, backgroundClass;

  if (showThumbnailGrid || showTransparency) {
    backgroundClass = 'plain';
  } else {
    backgroundClass = 'colorful';
  }

  if (showTransparency) {
    innerContent = (
      <TransparentOverlay>
        <TopNav />
        { children }
      </TransparentOverlay>
    );
  } else if (showEmbeddedApp) {
    innerContent = (
      <TransparentOverlay noColor={ true } >
        <IPhoneAppPreview content='embedded'>
          { children }
        </IPhoneAppPreview>
      </TransparentOverlay>
    );
  } else if (showSubredditPosts) {
    innerContent = <CompactSubreddit />;
  } else if (showStaticAppPreview || showSpeedAppPreview) {
    innerContent = <IPhoneAppPreview content='static' />;
  } else if (showGifAppPreview) {
    innerContent = <IPhoneAppPreview content='gif' />;
  } else {
    innerContent = <ThumbnailGrid />;
  }

  return (
    <div className={ `DualPartInterstitialHeader ${backgroundClass}` }>
      { innerContent }
    </div>
  );
};

export default connect(interstitialExperimentSelector)(DualPartInterstitialHeader);
