import React from 'react';
import ReactDOM from 'react-dom';
import SmartBanner from '../views/components/SmartBanner';
import TrackingPixel from './TrackingPixel';
import { shouldShowBanner, markBannerClosed } from './smartBannerState';

const ANIMATION_DELAY = 1000;
const ANIMATION_LENGTH = 200;
const BANNER_HEIGHT = 94;

export default function initBanner(impressionUrl, clickUrl) {
  if (!shouldShowBanner()) { return; }

  // create a container for our banner and add it to the body
  const bannerContainer = document.createElement('div');
  bannerContainer.className = 'SmartBannerContainer tween';
  document.body.appendChild(bannerContainer);

  // render the banner
  ReactDOM.render(
    <SmartBanner
      url={ clickUrl }
      onClose={ function() {
        // undo all the banner stuff
        markBannerClosed();
        bannerContainer.style.bottom = `-${BANNER_HEIGHT}px`;

        // give the animation a moment to complete before removing the banner
        // from the DOM
        setTimeout(() => {
          ReactDOM.unmountComponentAtNode(bannerContainer);
          document.body.classList.remove('banner-is-open');
          document.body.removeChild(bannerContainer);
        }, ANIMATION_LENGTH);
      } }
    />,
    bannerContainer
  );

  // animate the banner. add a small delay so that the content 'settles in'
  // before we animate anything. it feels less jarring this way.
  setTimeout(() => {
    bannerContainer.style.bottom = '0px';
    document.body.classList.add('banner-is-open');

    // create a pixel to track the impressions
    (new TrackingPixel({ url: impressionUrl })).fire();
  }, ANIMATION_DELAY);
}
