import React from 'react';
import constants from '../../constants';
import { models } from 'snoode';

import BaseComponent from './BaseComponent';
import Loading from '../components/Loading';
import Logo from '../components/icons/Logo';
import SeashellsDropdown from '../components/SeashellsDropdown';
import SnooIcon from '../components/icons/SnooIcon';
import SubredditAboutPage from '../pages/subredditAbout';

class TopNav extends BaseComponent {
  constructor(props) {
    super(props);

    this.state = {
      title: props.topNavTitle,
      link: props.topNavLink,
      subreddit: props.subreddit || props.dataCache.subreddit,
      loaded: true,
      sideNavOpen: false,
      data: props.data,
    };

    this._updateNavLink = this._updateNavLink.bind(this);
    this._onToggle = this._onToggle.bind(this);
    this._onSubscribeClick = this._onSubscribeClick.bind(this);
  }

  loadSubreddit(data) {
    if (data) {
      this.setState({
        loaded: false,
      });

      data.then(function(data) {
        this.setState({
          title: data.body.display_name,
          link: data.body.url,
          subreddit: data.body,
          loaded: true,
        });
      }.bind(this));
    }
  }

  componentDidMount() {
    this.loadSubreddit(this.state.data.get('subreddit'));
    this.props.app.on(constants.TOP_NAV_CHANGE, this._updateNavLink);
    this.props.app.on(constants.SIDE_NAV_TOGGLE, this._onToggle);
  }

  componentWillUnmount() {
    this.props.app.off(constants.TOP_NAV_CHANGE, this._updateNavLink);
    this.props.app.off(constants.SIDE_NAV_TOGGLE, this._onToggle);
  }

  render() {
    var props = this.props;
    var breadcrumbContents = this.state.title;
    var link = this.state.link;
    var currentSub = '';

    if (this.state.title) {
      if (this.state.subreddit) {
        currentSub = '?subreddit=' + this.state.title;
      }
    } else {
      link = '/';
      breadcrumbContents = <Logo />;
    }

    var isSubscribed = this.state.userIsSubscribed;
    var subscribedClass = isSubscribed ? 'saved' : '';

    var subredditMenu;

    if (this.state.subreddit) {
      subredditMenu = (
        <SeashellsDropdown right={ true } app={ props.app }>
          <li className='Dropdown-li'>
            <a className='MobileButton Dropdown-button' href={ `/r/${props.subredditName}/about` }>
              <span className='icon-info-circled'> </span>
              <span className='Dropdown-text'>{ `About ${props.subredditName}` }</span>
            </a>
          </li>
          <li className='Dropdown-li'>
            <a className='MobileButton Dropdown-button' href={ `${props.config.reddit}/r/${props.subredditName}/wiki` }
                          data-no-route='true'>
              <span className='icon-text-circled' > </span>
              <span className='Dropdown-text'>Wiki</span>
            </a>
          </li>
          <li className={`Dropdown-li ${props.token ? '' : 'hidden'}`}>
            <button className='Mobilebutton Dropdown-button' onClick={ this._onSubscribeClick }>
              <span className={'icon-save-circled ' + subscribedClass}> </span>
              <span className='Dropdown-text'>
                { this.state.subreddit.user_is_subscriber ? 'Unsubscribe' : 'Subscribe' }
              </span>
            </button>
          </li>
        </SeashellsDropdown>
      );
    }

    let notificationsCount;
    if (props.user && props.user.inbox_count) {
      notificationsCount = (
        <span className='badge badge-xs badge-orangered'>{ props.user.inbox_count }</span>
      );
    }

    var sideNavIcon = 'icon-hamburger';
    if (this.state.sideNavOpen) {
      sideNavIcon = 'icon-x';
    }

    return (
      <nav className={'TopNav' + (this.state.sideNavOpen ? ' opened' : '')}>
        <div className='pull-left TopNav-padding TopNav-left' key='topnav-menu'>
          <div className='TopNav-beta'>beta</div>
          <a className='MobileButton TopNav-padding TopNav-snoo' href='/'>
            <SnooIcon rainbow={ false }/>
          </a>
          <h1 className='TopNav-text TopNav-padding'>
            <span>
              <a className='TopNav-a' href={link}>
                {breadcrumbContents}
              </a>
            </span>
          </h1>
        </div>
        <div className='TopNav-padding TopNav-right' key='topnav-actions'>
          { subredditMenu }
          <a className='MobileButton TopNav-floaty' href={'/submit' + currentSub }>
            <span className='icon-post'>{' '}</span>
          </a>
          <a className='MobileButton TopNav-floaty' href={ (props.subredditName ? `/r/${props.subredditName}` : '') + "/search" }>
            <span className='icon-search'></span>
          </a>
          <button className='MobileButton TopNav-floaty' onClick={this._onClick.bind(this, 'hamburger')}>
            <span className={sideNavIcon}></span>
            { notificationsCount }
          </button>
        </div>
      </nav>
   );
  }

  _onSubscribeClick(event) {
    var state = this.state;

    if (state.subreddit) {
      var props = this.props;

      var subscription = new models.Subscription({
        action: state.subreddit.user_is_subscriber ? 'unsub' : 'sub',
        sr: state.subreddit.name
      });

      var options = Object.assign({}, this.props.apiOptions, {
        model: subscription,
      });

      this.setState({
        subreddit: Object.assign(subreddit, {
          user_is_subscriber: !state.subreddit.user_is_subscriber,
        })
      });

      // and send request to the server to do actual work
      this.props.app.api.subscriptions.post(options)
        .then(function (data) {
          // if it fails revert back to the original state
          if (Object.keys(data.data).length) {
            this.setState({
              subreddit: Object.assign(subreddit, {
                user_is_subscriber: !state.subreddit.user_is_subscriber,
              })
            });

            this.props.app.render('/400', false);
          }
        }.bind(this));
    }
  }

  _updateNavLink(title, link, dataPromise) {
    var state = this.state;

    if (title === state.title) {
      return;
    }

    if (dataPromise) {
      return this.loadSubreddit(dataPromise);
    }

    this.setState({
      subreddit: undefined,
      title: title,
      link: link,
    });
  }

  _onClick(str) {
    switch (str) {
      case 'hamburger':
        this.props.app.emit(constants.TOP_NAV_HAMBURGER_CLICK);
        break;
      case 'post':
        // TODO post
        break;
    }
  }

  _onToggle(bool) {
    this.setState({
      sideNavOpen: bool,
    });
  }
}

TopNav.propTypes = {
  multi: React.PropTypes.string,
  subredditName: React.PropTypes.string,
  userIsSubscribed: React.PropTypes.bool,
};

export default TopNav;
