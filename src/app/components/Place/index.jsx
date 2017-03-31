import './styles.less';

import React from 'react';
import config from 'config';
import includes from 'lodash/includes';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { redirect } from 'platform/actions';

import Loading from 'app/components/Loading';

import { PostsFromSubredditPage } from 'app/pages/PostsFromSubreddit';

const selector = createStructuredSelector({
  currentPageUrl: state => state.platform.currentPage.url,
  loggedOut: state => state.user.loggedOut,
  token: state => state.session.accessToken,
});

const mapDispatchToProps = dispatch => ({
  placeRedirect: () => dispatch(redirect('/place')),
});

export default connect(selector, mapDispatchToProps)(
  class Place extends React.Component {

    constructor(props) {
      super(props);

      this.state = {
        loading: true,
      };
    }

    componentDidMount() {
      const isSubredditPage = includes(this.props.currentPageUrl, '/r/place');

      if (!this.props.loggedOut && !isSubredditPage) {
        this.ifr.onload = () => {
          this.setState({ loading: false });
          this.ifr.contentWindow.postMessage(
            JSON.stringify({
              name: 'PLACE_MESSAGE',
              payload: {
                Authorization: 'bearer ' + this.props.token,
              },
            }),
            config.placeDomain
          );
        };
      } else {
        this.ifr.onload = () => {
          this.setState({ loading: false });
        };
      }
    }

    render() {
      const isSubredditPage = includes(this.props.currentPageUrl, '/r/place');
      const placeUrl = config.placeDomain + '/place?webview=true';

      const { placeRedirect } = this.props;

      return (
          <div className="Place__container">
            { this.state.loading ?
                (<div className="Place__loadingWrapper">
                  <Loading />
                </div>) : null }
            { this.renderPlaceIframeRedirect(isSubredditPage, placeRedirect) }
            <iframe
              className={ `Place__iframe ${isSubredditPage ? 'small' : 'large'}` }
              ref={
                (f) => {
                  this.ifr = f;
                }
              }
              src={ `${placeUrl}${ isSubredditPage ? '&hide_palette=true' : '' }` }
              frameBorder="0"
            />
            { this.renderSubreddit(isSubredditPage) }
          </div>
      );
    }

    renderSubreddit = isSubredditPage => {
      if (isSubredditPage) {
        return <PostsFromSubredditPage { ...this.props } />;
      }
    }

    renderPlaceIframeRedirect = (isSubredditPage, redirectAction) => {
      if (isSubredditPage) {
        return <div className="Place__click" onClick={ redirectAction } />;
      }
    }
  }
);
