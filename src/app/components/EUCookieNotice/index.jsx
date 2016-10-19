import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import config from 'config';
import * as euCookieActions from 'app/actions/euCookieNotice';

const T = React.PropTypes;

class EUCookieNotice extends React.Component {
  static propTypes = {
    // connectProps
    show: T.bool.isRequired,
    url: T.string.isRequired, // we need this in the selector to re-render and
    // increment display count when the page changes
    onCookieNoticeRendered: T.func.isRequired,
    onClose: T.func.isRequired,
  };

  updateDisplayCount() {
    if (this.props.show) {
      this.props.onCookieNoticeRendered();
    }
  }

  componentDidMount() {
    this.updateDisplayCount();
  }

  componentDidUpdate() {
    this.updateDisplayCount();
  }

  render() {
    if (!this.props.show) { return null; }

    const { onClose } = this.props;

    return (
      <div className='EUCookieNotice'>
        <div className='EUCookieNotice__content'>
          <div className='EUCookieNotice__close' onClick={ onClose }>
            <span className='icon icon-x' />
          </div>
          <p>
            Cookies help us deliver our Services.
            By using our Services, you agree to our use of cookies.
            <a
              className='EUCookieNotice__link'
              target='_blank'
              href={ `${config.reddit}/help/privacypolicy` }
            >
              Learn More
            </a>
          </p>
        </div>
      </div>
    );
  }
}

const selector = createSelector(
  state => state.euCookieNotice.showEUCookie,
  // force the component to re-render on different urls so that we increment
  // the display count. This ignores query params for simplicity, which seems fine.
  // Using just `state.platform.currentPage` led to mixed results as the currentPage
  // is updated on shellActivation.
  state => state.platform.currentPage.url,
  (show, url) => ({ show, url }),
);

const mapDispatchToProps = dispatch => ({
  onCookieNoticeRendered: () => dispatch(euCookieActions.displayed()),
  onClose: () => dispatch(euCookieActions.hide()),
});

export default connect(selector, mapDispatchToProps)(EUCookieNotice);
