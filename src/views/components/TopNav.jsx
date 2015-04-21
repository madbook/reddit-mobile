import React from 'react/addons';
import constants from '../../constants';
import { models } from 'snoode';

import SnooButtonFactory from '../components/SnooButton';
var SnooButton;

import PostIconFactory from '../components/icons/PostIcon';
var PostIcon;

import SearchIconFactory from '../components/icons/SearchIcon';
var SearchIcon;

import LogoFactory from '../components/Logo';
var Logo;

import HamburgerIconFactory from '../components/icons/HamburgerIcon';
var HamburgerIcon;

import MobileButtonFactory from '../components/MobileButton';
var MobileButton;

import SeashellIconFactory from '../components/icons/SeashellIcon';
var SeashellIcon;

import SaveIconFactory from '../components/icons/SaveIcon';
var SaveIcon;

import SeashellsDropdownFactory from '../components/SeashellsDropdown';
var SeashellsDropdown;

import LoadingFactory from '../components/Loading';
var Loading;

import SubredditAboutPageFactory from '../pages/subredditAbout';
var SubredditAboutPage;

import InfoIconFactory from '../components/icons/InfoIcon';
var InfoIcon;

import TextIconFactory from '../components/icons/TextIcon';
var TextIcon;

function shorten(text, len) {
  if (text.length > 15) {
    text = text.substr(0, Math.min(13, len-2)) + '…';
  }

  return text;
}

function loadSubredditData(ctx) {
  SubredditAboutPage.populateData(ctx.props.api, ctx.props, true, false).done(function (data) {
    ctx.setState({
      loaded: true,
      subredditId: ((data || {}).data || {}).name,
      userIsSubscribed: ((data || {}).data || {}).user_is_subscriber
    });
  });
}

class TopNav extends React.Component {
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

    this.props.app.on(constants.TOP_NAV_SUBREDDIT_CHANGE, this._changeSubredditName);
    this.props.app.on(constants.SIDE_NAV_TOGGLE, this._onToggle);
  }

  componentWillUnmount() {
    this.props.app.off(constants.TOP_NAV_SUBREDDIT_CHANGE, this._changeSubredditName);
    this.props.app.off(constants.SIDE_NAV_TOGGLE, this._onToggle);
  }

  render() {
    var props = this.props;
    var content = null;

    if (this.state.loaded) {
      var subredditName = shorten(this.state.subredditName || '', 20);

      if (subredditName) {
        var breadcrumbLink = '/' + this.state.subredditName;
        var breadcrumbContents = subredditName;
      } else {
        breadcrumbLink = '/';
        breadcrumbContents = <Logo/>;
      }

      var subredditMenu = null;
      if (props.subredditName) {
        subredditMenu = (
          <SeashellsDropdown app={ props.app } right={ true }>
            <li className='Dropdown-li'>
              <MobileButton className='Dropdown-button' href={ `/r/${props.subredditName}/about` }>
                <InfoIcon/>
                <span className='Dropdown-text'>{ `About ${props.subredditName}` }</span>
              </MobileButton>
            </li>
            <li className='Dropdown-li'>
              <MobileButton className='Dropdown-button' href={ `//www.reddit.com/${props.subredditName}/wiki` }
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

      content = [
        <div className='pull-left TopNav-padding' key='topnav-menu'>
          <div className='TopNav-beta'>beta</div>
          <MobileButton className='TopNav-floaty' onClick={this._onClick.bind(this, 'hamburger')}>
            <HamburgerIcon altered={this.state.sideNavOpen}/>
          </MobileButton>
          <h1 className='TopNav-text TopNav-floaty'>
            <span className='TopNavHeadline'>
              <MobileButton className='TopNav-a' href={breadcrumbLink}>
                {breadcrumbContents}
              </MobileButton>
            </span>
          </h1>
        </div>,
        <div className='pull-right TopNav-padding' key='topnav-actions'>
          <MobileButton className='TopNav-floaty TopNav-search' href={ (props.subredditName ? `/r/${props.subredditName}` : '') + "/search" }>
            <SearchIcon/>
          </MobileButton>
          { subredditMenu }
        </div>,
      ];
    } else {
      content = <Loading />;
    }

    return (
      <nav className='TopNav shadow'>
        { content }
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

      var options = props.api.buildOptions(props.token);
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
            props.app.render('/400', false);
          }
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
        this.props.app.emit(constants.TOP_NAV_HAMBURGER_CLICK);
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

function TopNavFactory(app) {
  SnooButton = SnooButtonFactory(app);
  PostIcon = PostIconFactory(app);
  SearchIcon = SearchIconFactory(app);
  InfoIcon = InfoIconFactory(app);
  HamburgerIcon = HamburgerIconFactory(app);
  MobileButton = MobileButtonFactory(app);
  Logo = LogoFactory(app);
  SeashellIcon = SeashellIconFactory(app);
  SaveIcon = SaveIconFactory(app);
  TextIcon = TextIconFactory(app);
  SeashellsDropdown = SeashellsDropdownFactory(app);
  Loading = LoadingFactory(app);
  SubredditAboutPage = SubredditAboutPageFactory(app);
  return app.mutate('core/components/TopNav', TopNav);
}

export default TopNavFactory;
