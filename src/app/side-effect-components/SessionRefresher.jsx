import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import * as sessionRefreshingActions from 'app/actions/sessionRefreshing';

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
      this.timeoutId = setTimeout(this.props.refreshSession, when);
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
  refreshSession: () => dispatch(sessionRefreshingActions.refresh()),
});

export default connect(mapStateToProps, mapDispatchToProps)(_SessionRefresh);
