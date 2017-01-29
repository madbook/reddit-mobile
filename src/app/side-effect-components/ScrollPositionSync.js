import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import raf from 'raf';

import { urlFromPage } from 'platform/pageUtils';
import * as scrollPositionActions from 'app/actions/scrollPosition';

class _ScrollPositionSync extends React.Component {
  constructor(props) {
    super(props);

    const { url, scrollY } = props;
    this.state = { url, scrollY };
    this.callMeasureScrollPosition = this.callMeasureScrollPosition.bind(this);
    this.measureScrollPosition = this.measureScrollPosition.bind(this);
  }

  componentDidMount() {
    window.addEventListener('scroll', this.callMeasureScrollPosition);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.callMeasureScrollPosition);
  }

  shouldComponentUpdate() {
    return false; // we don't render so we shouldn't have to updated
  }

  callMeasureScrollPosition() {
    // Measuring the DOM in the middle of mutations can cause forced (and unnecessary)
    // sync layouts. Use'ing raf should avoid this
    raf(this.measureScrollPosition);
  }

  measureScrollPosition() {
    this.setState({ scrollY: document.body.scrollTop });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.url !== this.state.url) {
      this.props.onSaveScrollPosition(this.state.url, this.state.scrollY);
      const { url, scrollY } = nextProps;
      this.setState({ url, scrollY });

      raf(() => {
        document.body.scrollTop = scrollY;
      });
    }
  }

  render() { return null; } // we don't render anything;
}

// We need to generate a hash key for the scoll cache,
// use the pages full url with queryparams, hashpaams, etc
const scrollUrl = page => urlFromPage(page);

const mapStateToProps = createSelector(
  state => scrollUrl(state.platform.currentPage),
  state => {
    const { scrollPositions, platform: { currentPage }} = state;
    return scrollPositions[scrollUrl(currentPage)] || 0;
  },
  (url, scrollY) => ({ url, scrollY }),
);

const mapDispatchToProps = dispatch => ({
  onSaveScrollPosition(url, scrollY) {
    dispatch(scrollPositionActions.save(url, scrollY));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(_ScrollPositionSync);
