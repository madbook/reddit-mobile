import './styles.less';
import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Motion, spring } from 'react-motion';

import { promoListingAnimated } from 'app/actions/xpromo';
import cx from 'lib/classNames';

const CLASS = 'XPromoListingClickInterstitial';

const selector = createStructuredSelector({
  showing: state => state.smartBanner.showingListingClickInterstitial,
});

const dispatcher = dispatch => ({
  onAnimationComplete: () => dispatch(promoListingAnimated()),
});

export default connect(selector, dispatcher)(
  class XPromoListingClickInterstitial extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        showing: false,
        animating: false,
        computedContentHeight: 0,
      };
    }

    componentWillReceiveProps(nextProps) {
      const { showing } = nextProps;
      if (showing !== this.state.showing) {
        this.setState({
          showing,
          animating: false,
        });
      }
    }

    startSlideupAnimation = contentRef => {
      if (!this.state.animating && this.state.showing && contentRef) {
        const computedContentHeight = contentRef.getBoundingClientRect().height;
        this.setState({
          computedContentHeight,
          animating: true,
        });
      }
    }

    render() {
      const { animating, showing, computedContentHeight } = this.state;
      const { onAnimationComplete } = this.props;

      if (!showing) {
        return <div className={ `${CLASS}__preloadImage` } />;
      }

      // NOTE: the `key` property on motion forces a re-render to trigger
      // the animation. When we first show, we don't know the content height,
      // so we render with `visibility: hidden` to measure the interstitial height.
      // React-Motion ignores the `defaultState` object on subsequent renders,
      // so the first render won't have the correct `defaultStyle` property
      // for our animation. Using a key forces an update, so we properly animate

      return (
        <div className={ CLASS }>
          <Motion
            key={ `${animating ? 'animating' : 'none' }` }
            defaultStyle={ {
              bottom: -computedContentHeight,
            } }
            style={ {
              bottom: spring(0, { stiffness: 400 }),
            } }
            onRest={ () => {
              if (animating) {
                onAnimationComplete();
              }
            } }
          >
            { style => this.renderSlideup(style) }
          </Motion>
        </div>
      );
    }

    renderSlideup = motionStyle => {
      const { showing, animating } = this.state;

      return (
        <div
          className={ cx(`${CLASS}__slideupWrapper`, {
            'm-hidden': showing && !animating,
          }) }
          ref={ this.startSlideupAnimation }
          style={ motionStyle }
        >
          <div className={ `${CLASS}__backgroundPattern` } />
          <div className={ `${CLASS}__content` }>
            <div className={ `${CLASS}__tagline` }>
              Redirecting you to the Reddit mobile app.
            </div>
            <div className={ `${CLASS}__downloadPromotionCopy` }>
              Download and install the Reddit mobile app for faster speed, infinite scroll, and autoplaying gifs!
            </div>
          </div>
        </div>
      );
    }
});
