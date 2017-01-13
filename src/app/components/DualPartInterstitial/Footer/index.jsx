import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import getSubreddit from 'lib/getSubredditFromState';

const List = () => {
  return (
    <div className='DualPartInterstitialFooter__bulletList'>
      <div className='DualPartInterstitialFooter__bulletItem'>
        <span className='DualPartInterstitialFooter__bulletIcon icon icon-controversial' />
        50% Faster
      </div>
      <div className='DualPartInterstitialFooter__bulletItem'>
        <span className='DualPartInterstitialFooter__bulletIcon icon icon-compact' />
        Infinite Scroll
      </div>
      <div className='DualPartInterstitialFooter__bulletItem'>
        <span className='DualPartInterstitialFooter__bulletIcon icon icon-play_triangle' />
        Autoplay GIFs
      </div>
    </div>
  );
};

const DualPartInterstitialFooter = (props) => {
  const {
    subredditName,
    nativeAppLink,
    onClose,
    navigator,
  } = props;

  const pageName = subredditName ? `r/${ subredditName }` : 'Reddit';
  const subtitleText = `View ${ pageName } in the app because you deserve the best.`;

  return (
    <div className='DualPartInterstitialFooter'>
      <div className='DualPartInterstitialFooter__content'>
        <div className='DualPartInterstitialFooter__subtitle'>
          { subtitleText }
        </div>
        <List />
        <div className='DualPartInterstitialFooter__button' onClick={ navigator(nativeAppLink) }>
          Continue
        </div>
        <div className='DualPartInterstitialFooter__dismissal'>
          <span className='DualPartInterstitialFooter__dismissalText'>
            { 'or go to the ' }
          </span>
          <a className='DualPartInterstitialFooter__dismissalLink' onClick={ onClose }>
            mobile site
          </a>
        </div>
      </div>
    </div>
  );
};

const selector = createSelector(
  getSubreddit,
  (subredditName) => {
    return { subredditName };
  }
);

export default connect(selector)(DualPartInterstitialFooter);
