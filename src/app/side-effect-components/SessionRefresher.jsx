import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import * as sessionActions from 'app/actions/session';

class _SessionRefresh extends React.Component {
  constructor(props) {
    super(props);

    this.timeoutId = 0;
    this.mounted = false;
  }

  componentDidMount() {
    this.mounted = true;
    const { session } = this.props;
    this.awaitSession(session);
  }

  awaitSession(session) {
    clearTimeout(this.timeoutId);
    if (session.refreshToken) {
      const now = new Date();
      const when = (new Date(session.expires) - now) * 0.9;
      this.timeoutId = setTimeout(this.refreshSession, when);
    }
  }

  refreshSession = async (retrying=false) => {
    if (!this.props.session.refresh) { console.log('no session'); return; }
    try {
      const refreshed = await this.props.session.refresh();
      this.props.onRefreshed(refreshed);
    } catch (e) {
      if (!retrying) {
        // retry, only once, somewhere between 1 and 3 seconds later
        this.timeoutId = setTimeout(this.refreshSession,
          Math.floor(1000 * Math.random() * 2000),
        );
      }
    }
  }

  shouldComponentUpdate(nextProps) {
    if (this.mounted && nextProps.session) {
      this.awaitSession(nextProps.session);
    }

    return false;
  }

  render() { return null; }
}

const mapStateToProps = createSelector(
  state => state.session,
  (session) => ({ session }),
);

const mapDispatchToProps = (dispatch) => ({
  onRefreshed: (session) => dispatch(sessionActions.setSession(session)),
});

export const SessionRefresher = connect(mapStateToProps, mapDispatchToProps)(_SessionRefresh);
