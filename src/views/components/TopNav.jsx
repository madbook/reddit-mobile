import React from 'react';
import constants from '../../constants';
import globals from '../../globals';
import { models } from 'snoode';

import HamburgerIcon from '../components/icons/HamburgerIcon';
import InfoIcon from '../components/icons/InfoIcon';
import Loading from '../components/Loading';
import Logo from '../components/Logo';
import MobileButton from '../components/MobileButton';
import PostIcon from '../components/icons/PostIcon';
import SaveIcon from '../components/icons/SaveIcon';
import SearchIcon from '../components/icons/SearchIcon';
import SeashellIcon from '../components/icons/SeashellIcon';
import SeashellsDropdown from '../components/SeashellsDropdown';
import SnooIcon from '../components/icons/SnooIcon';
import SubredditAboutPage from '../pages/subredditAbout';
import TextIcon from '../components/icons/TextIcon';
import BaseComponent from './BaseComponent';

function removeR(text) {
  return text.substr(2);
}

function loadSubredditData(ctx) {
  if (ctx.props.subredditName &&
      ctx.props.subredditName.indexOf('+') === -1 &&
      ctx.props.subredditName !== 'all') {

    SubredditAboutPage.populateData(ctx.props.api, ctx.props, true, false).done(function (data) {
      ctx.setState({
        loaded: true,
        subredditId: ((data || {}).data || {}).name,
        userIsSubscribed: ((data || {}).data || {}).user_is_subscriber
      });
    });
  }
}

class TopNav extends BaseComponent {
  constructor(props) {
    super(props);

    var subredditName;

    if (props.multi) {
      subredditName = 'm/' + props.multi;
    } else if (props.subredditName) {
      subredditName = 'r/' + props.subredditName;
    }

    this.state = {
      subredditName: subredditName,
      loaded: true,
      subredditId: props.subredditId,
      userIsSubscribed: props.userIsSubscribed,
      sideNavOpen: false,
    };

    this._changeSubredditName = this._changeSubredditName.bind(this);
    this._onToggle = this._onToggle.bind(this);
    this._onSubscribeClick = this._onSubscribeClick.bind(this);
  }

  componentDidMount() {
    if (!this.state.loaded) {
      loadSubredditData(this);
    }

    globals().app.on(constants.TOP_NAV_SUBREDDIT_CHANGE, this._changeSubredditName);
    globals().app.on(constants.SIDE_NAV_TOGGLE, this._onToggle);
  }

  componentWillUnmount() {
    globals().app.off(constants.TOP_NAV_SUBREDDIT_CHANGE, this._changeSubredditName);
    globals().app.off(constants.SIDE_NAV_TOGGLE, this._onToggle);
  }

  render() {
    var props = this.props;
    var subredditName = removeR(this.state.subredditName || '', 9);
    var currentSub = '';
    if (subredditName) {
      var breadcrumbLink = '/' + this.state.subredditName;
      var breadcrumbContents = subredditName;
      currentSub = '?subreddit=' + this.state.subredditName;
    } else {
      breadcrumbLink = '/';
      breadcrumbContents = <Logo />;
    }

    var subredditMenu = null;
    if (props.subredditName &&
        props.subredditName.indexOf('+') === -1 &&
        props.subredditName !== 'all') {
      subredditMenu = (
        <SeashellsDropdown right={ true }>
          <li className='Dropdown-li'>
            <MobileButton className='Dropdown-button' href={ `/r/${props.subredditName}/about` }>
              <InfoIcon/>
              <span className='Dropdown-text'>{ `About ${props.subredditName}` }</span>
            </MobileButton>
          </li>
          <li className='Dropdown-li'>
            <MobileButton className='Dropdown-button' href={ `${props.reddit}/r/${props.subredditName}/wiki` }
                          data-no-route='true'>
              <TextIcon/>
              <span className='Dropdown-text'>Wiki</span>
            </MobileButton>
          </li>
          <li className={`Dropdown-li ${props.token ? '' : 'hidden'}`}>
            <MobileButton className='Dropdown-button' onClick={ this._onSubscribeClick }>
              <SaveIcon altered={this.state.userIsSubscribed}/>
              <span className='Dropdown-text'>
                { this.state.userIsSubscribed ? 'Unsubscribe' : 'Subscribe' }
              </span>
            </MobileButton>
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

    return (
      <nav className={'TopNav' + (this.state.sideNavOpen ? ' opened' : '')}>
        <div className='pull-left TopNav-padding TopNav-left' key='topnav-menu'>
          <div className='TopNav-beta'>beta</div>
          <MobileButton className='TopNav-padding TopNav-snoo' href='/'>
            <SnooIcon rainbow={ false }/>
          </MobileButton>
          <h1 className='TopNav-text TopNav-padding'>
            <span className='TopNav-headline'>
              <MobileButton className='TopNav-a' href={breadcrumbLink}>
                {breadcrumbContents}
              </MobileButton>
            </span>
          </h1>
        </div>
        <div className='TopNav-padding TopNav-right' key='topnav-actions'>
          { subredditMenu }
          <MobileButton className='TopNav-floaty TopNav-post' href={'/submit' + currentSub }>
            <PostIcon noCircle={ true }/>
          </MobileButton>
          <MobileButton className='TopNav-floaty TopNav-search' href={ (props.subredditName ? `/r/${props.subredditName}` : '') + "/search" }>
            <SearchIcon/>
          </MobileButton>
          <MobileButton className='TopNav-floaty TopNav-hamburger' onClick={this._onClick.bind(this, 'hamburger')}>
            <HamburgerIcon altered={this.state.sideNavOpen}/>
            { notificationsCount }
          </MobileButton>
        </div>
      </nav>
   );
  }

  _onSubscribeClick(event) {
    var state = this.state;
    if (state.subredditId) {
      var props = this.props;

      var subscription = new models.Subscription({
        action: state.userIsSubscribed ? 'unsub' : 'sub',
        sr: state.subredditId
      });

      var options = props.api.buildOptions(props.apiOptions);
      options = Object.assign(options, {
        model: subscription
      });

      // react immediately and assuming everything goes well,
      this.setState({
        userIsSubscribed: !state.userIsSubscribed
      });

      // and send request to the server to do actual work
      props.api.subscriptions.post(options)
        .done(function (data) {
          // if it fails revert back to the original state
          if (Object.keys(data.data).length) {
            this.setState({
              userIsSubscribed: !state.userIsSubscribed
            });
            globals().app.render('/400', false);
          }

          // Reset subscriptions so they are loaded next request
          globals().app.setState('subscriptions', undefined);
        }.bind(this));
    }
  }

  _changeSubredditName(newName) {
    var state = this.state;
    var currentSubredditName = state.subredditName;
    if (currentSubredditName !== newName) {
      var loaded = true;
      var userIsSubscribed = state.userIsSubscribed;

      // if it's subreddit do more work
      if (newName && newName.startsWith('r/') && newName.indexOf(currentSubredditName) !== 0) {
        loaded = !(newName && this.props.token);
        if (!loaded) {
          userIsSubscribed = false;
          loadSubredditData(this);
        }
      }

      this.setState({
        subredditName: newName,
        loaded: loaded,
        userIsSubscribed: userIsSubscribed
      });
    }
  }

  _onClick(str) {
    switch (str) {
      case 'hamburger':
        globals().app.emit(constants.TOP_NAV_HAMBURGER_CLICK);
        break;
      case 'post':
        // TODO post
        break;
    }
  }

  _onToggle(bool) {
    this.setState({sideNavOpen: bool});
  }
}

export default TopNav;
