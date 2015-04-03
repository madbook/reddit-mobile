import React from 'react/addons';
import constants from '../../constants';
import { models } from 'snoode';

import SnooButtonFactory from '../components/SnooButton';
var SnooButton;

import PostIconFactory from '../components/PostIcon';
var PostIcon;

import SearchIconFactory from '../components/SearchIcon';
var SearchIcon;

import LogoFactory from '../components/Logo';
var Logo;

import HamburgerIconFactory from '../components/HamburgerIcon';
var HamburgerIcon;

import MobileButtonFactory from '../components/MobileButton';
var MobileButton;

import EllipsisIconFactory from '../components/EllipsisIcon';
var EllipsisIcon;

import DropdownFactory from '../components/Dropdown';
var Dropdown;

import LoadingFactory from '../components/Loading';
var Loading;

import SubredditAboutPageFactory from '../pages/subredditAbout';
var SubredditAboutPage;

function shorten(text, len) {
  if (text.length > 15) {
    text = text.substr(0, Math.min(13, len-2)) + '…';
  }

  return text;
}

function loadSubredditData(ctx) {
  // NOTE:
  //  cannot call with `ctx.props` because `ctx.props.data`
  //  could lead to a wrong cached resource
  SubredditAboutPage.populateData(ctx.props.api, {
    subredditName: ctx.props.subredditName,
    token: ctx.props.token
  }, true).done((function (data) {
    ctx.setState({
      loaded: true,
      subredditId: ((data || {}).data || {}).name,
      userIsSubscribed: ((data || {}).data || {}).user_is_subscriber
    });
  }).bind(ctx));
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
      subredditId: null,
      rollover: '',
      sideNavOpen: false,
      loaded: !(props.subredditName && props.token),
      userIsSubscribed: false
    };

    this._changeSubredditName = this._changeSubredditName.bind(this);
    this._onToggle = this._onToggle.bind(this);
    this._onMouseLeave = this._onMouseLeave.bind(this);
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
    var content = null;

    if (this.state.loaded) {
      var props = this.props;

      var subredditName = shorten(this.state.subredditName || '', 20);

      if (subredditName) {
        var breadcrumbLink = '/' + this.state.subredditName;
        var breadcrumbContents = subredditName;
      } else {
        breadcrumbLink = '/';
        breadcrumbContents = <Logo played={this.state.rollover === 'breadcrumb'}/>;
      }

      var subredditMenu = null;
      if (props.subredditName) {
        var button = (
          <button className="TopNav-floaty TopNav-search">
            <EllipsisIcon opened={ false } />
          </button>
        );
        subredditMenu = (
          <Dropdown app={ props.app } right={ true } button={ button } id={ this.state.subredditName }>
            <li className='Dropdown-li'>
              <MobileButton className='Dropdown-button' href={ `/r/${props.subredditName}/about` }>
                <span className='Dropdown-text'>{ `About ${props.subredditName}` }</span>
              </MobileButton>
            </li>
            <li className='Dropdown-li'>
              <MobileButton className='Dropdown-button' href={ `//www.reddit.com/${props.subredditName}/wiki` }
                            data-no-route='true'>
                <span className='Dropdown-text'>Wiki</span>
              </MobileButton>
            </li>
            <li className={`Dropdown-li ${props.token ? '' : 'hidden'}`}>
              <MobileButton className='Dropdown-button' onClick={ this._onSubscribeClick }>
                <span className='Dropdown-text'>
                  { this.state.userIsSubscribed ? 'Unsubscribe' : 'Subscribe' }
                </span>
              </MobileButton>
            </li>
          </Dropdown>
        );
      }

      content = [
        <div className='pull-left TopNav-padding' key='topnav-menu'>
          <div className='TopNav-beta'>beta</div>
          <MobileButton className='TopNav-floaty' onClick={this._onClick.bind(this, 'hamburger')} over={this._onMouseEnter.bind(this, 'hamburger')} out={this._onMouseLeave}>
            <HamburgerIcon played={this.state.rollover === 'hamburger'} altered={this.state.sideNavOpen}/>
          </MobileButton>
          <h1 className='TopNav-text TopNav-floaty'>
            <span className='TopNavHeadline'>
              <MobileButton className='TopNav-a' href={breadcrumbLink} over={this._onMouseEnter.bind(this, 'breadcrumb')} out={this._onMouseLeave}>
                {breadcrumbContents}
              </MobileButton>
            </span>
          </h1>
        </div>,
        <div className='pull-right TopNav-padding' key='topnav-actions'>
          <MobileButton className='TopNav-floaty TopNav-post' over={this._onMouseEnter.bind(this, 'post')} out={this._onMouseLeave} onClick={this._onClick.bind(this, 'post')}>
            <PostIcon played={this.state.rollover === 'post'}/>
          </MobileButton>
          <MobileButton className='TopNav-floaty TopNav-search' over={this._onMouseEnter.bind(this, 'search')} out={this._onMouseLeave} onClick={this._onClick.bind(this, 'search')}>
            <SearchIcon played={this.state.rollover === 'search'}/>
          </MobileButton>
          { subredditMenu }
        </div>
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
        action: this.state.userIsSubscribed ? 'unsub' : 'sub',
        sr: state.subredditId
      });

      var options = props.api.buildOptions(props.token);
      options = Object.assign(options, {
        model: subscription
      });

      props.api.subscriptions.post(options)
        .done(function (data) {
          if (!Object.keys(data.data).length) {
            this.setState({
              userIsSubscribed: !this.state.userIsSubscribed
            });
          } else {
            window.console.warn(data);
          }
        }.bind(this));
    }
  }

  _changeSubredditName(str) {
    var loaded = !(str && this.props.token);

    if (!loaded) {
      loadSubredditData(this);
    }

    this.setState({
      subredditName: str,
      loaded: loaded,
      userIsSubscribed: false
    });
  }

  _onMouseEnter(str) {
    this.setState({rollover: str});
  }

  _onMouseLeave() {
    this.setState({rollover: ''});
  }

  _onClick(str) {
    switch (str) {
      case 'hamburger':
        this.props.app.emit(constants.TOP_NAV_HAMBURGER_CLICK);
        break;
      case 'search':
        // TODO search
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
  HamburgerIcon = HamburgerIconFactory(app);
  MobileButton = MobileButtonFactory(app);
  Logo = LogoFactory(app);
  EllipsisIcon = EllipsisIconFactory(app);
  Dropdown = DropdownFactory(app);
  Loading = LoadingFactory(app);
  SubredditAboutPage = SubredditAboutPageFactory(app);
  return app.mutate('core/components/TopNav', TopNav);
}

export default TopNavFactory;
