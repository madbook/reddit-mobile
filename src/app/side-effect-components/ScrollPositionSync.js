import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import raf from 'raf';
import omit from 'lodash/omit';
import { urlFromPage } from '@r/platform/pageUtils';

import { OVERLAY_MENU_PARAMETER } from 'app/actions/overlayMenu';
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

// We want to ignore urls that are for overlay menus, those render above content
// so they shouldn't have their own scroll position state.
const scrollUrl = page => {
  const { url, hashParams, queryParams } = page;
  return urlFromPage({
    url,
    hashParams,
    queryParams: omit(queryParams, [OVERLAY_MENU_PARAMETER]),
  });
};

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
