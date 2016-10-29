import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import onVisibilityChange from 'lib/onVisibilityChange';
import * as sessionRefreshingActions from 'app/actions/sessionRefreshing';

const FIVE_MIN = 5 * 60 * 1000;

class SessionRefresh extends React.Component {
  refreshTimer = null;

  componentDidMount() {
    // on initial render get the most up-to-date refresh token
    this.refreshSession();

    // when stale tabs come back into focus, attempt refresh as well
    onVisibilityChange(() => this.refreshSession({ expiredOnly: true }));
  }

  componentDidUpdate() {
    // if the component gets a new session, it will update, and the timer needs
    // to restart
    this.startRefreshTimer();
  }

  startRefreshTimer() {
    clearTimeout(this.refreshTimer);
    // set up the refresh timer but defend against potentially too low timeouts
    const when = Math.max((this.props.session.expires - Date.now()) * 0.9, FIVE_MIN);
    this.refreshTimer = setTimeout(() => this.refreshSession(), when);
  }

  refreshSession({ expiredOnly=false }={}) {
    if (this.props.session.refreshToken) {
      if (expiredOnly && this.props.session.isValid) {
        return;
      }
      this.props.refreshSession();
    }
  }

  render() { return null; }
}


const mapStateToProps = createSelector(
  state => state.session,
  (session) => ({ session }),
);

const mapDispatchToProps = (dispatch) => ({
  refreshSession: () => dispatch(sessionRefreshingActions.refresh()),
});

export default connect(mapStateToProps, mapDispatchToProps)(SessionRefresh);
