import React from 'react';
import constants from '../../constants';

import MobileButtonFactory from '../components/MobileButton';
var MobileButton;

import MailIconFactory from '../components/icons/MailIcon';
var MailIcon;

import SettingsIconFactory from '../components/icons/SettingsIcon';
var SettingsIcon;

import SnooIconFactory from '../components/icons/SnooIcon';
var SnooIcon;

import TwirlyIconFactory from '../components/icons/TwirlyIcon';
var TwirlyIcon;

class SideNav extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      opened: false,
      twirly: '',
      compact: props.compact,
    };

    this._onTwirlyClick = this._onTwirlyClick.bind(this);
    this._toggle = this._toggle.bind(this);
    this._close = this._close.bind(this);
    this._onViewClick = this._onViewClick.bind(this);
    this._onScroll = this._onScroll.bind(this);
  }

  componentDidMount() {
    this.props.app.on(constants.TOP_NAV_HAMBURGER_CLICK, this._toggle);
    this.props.app.on('route:start', this._close);
  }

  componentWillUnmount() {
    this.props.app.off(constants.TOP_NAV_HAMBURGER_CLICK, this._toggle);
    this.props.app.off('route:start', this._close);
  }

  render() {
    var user = this.props.user;
    var loginLink;
    var logoutLink;
    var inboxLink;
    var compact = this.state.compact;


    var twirly = this.state.twirly;
    var isAbout = twirly === 'about';
    var isSubreddits = twirly === 'subreddits';

    if (user) {
      loginLink = (
        <li>
          <MobileButton className='SideNav-button' href={ '/u/' + user.name }>
            <SnooIcon/>
            <span className='SideNav-text'>{ user.name }</span>
          </MobileButton>
        </li>
      );

      logoutLink = (
        <li>
          <MobileButton className='SideNav-button' href='/logout' data-no-route='true'>
            <SnooIcon/>
            <span className='SideNav-text'>Log out</span>
          </MobileButton>
        </li>
      );

      var inboxCount = user.inbox_count;
      if(inboxCount > 0) {
        var newMail = <strong> ({inboxCount})</strong>;
      }
      inboxLink = (
        <li>
          <MobileButton className='SideNav-button' href='/message/inbox/'>
            <MailIcon/>
            <span className='SideNav-text'>Inbox{newMail}</span>
          </MobileButton>
        </li>
      );
    } else {
      loginLink = (
        <li>
          <MobileButton className='SideNav-button' href={ this.props.loginPath } data-no-route='true'>
            <SnooIcon/>
            <span className='SideNav-text'>Login / Register</span>
          </MobileButton>
        </li>
      );
    }

    var subreddits = this.props.subscriptions || [];

    var subredditLinks = (
      <li className={'SideNav-dropdown' + (isSubreddits ? ' opened' : '')}>
        <MobileButton className='SideNav-button' onClick={this._onTwirlyClick.bind(this, 'subreddits')}>
          <TwirlyIcon altered={isSubreddits}/>
          <span className='SideNav-text'>My Subreddits</span>
        </MobileButton>
        <ul className='SideNav-ul list-unstyled'>
          {
            subreddits.map((d) => {
              if(d.icon) {
                var icon = <figure className='SideNav-icon' style={{backgroundImage: 'url(' + d.icon + ')'}}/>;
              } else {
                icon = <SnooIcon/>;
              }
              return (
                <li key={`SideNav-li-${d.url}`}>
                  <MobileButton className='SideNav-button' href={ d.url }>
                    {icon}
                    <span className='SideNav-text'>{d.display_name}</span>
                  </MobileButton>
                </li>
              );
            })
          }
        </ul>
      </li>
    );

    return (
      <nav className={'SideNav tween shadow' + (this.state.opened?' opened':'')}>
        <ul className='list-unstyled'>
          { loginLink }
          { logoutLink }
          <li>
            <MobileButton className='SideNav-button' onClick={this._onViewClick}>
              <SettingsIcon/>
              <span className='SideNav-text'>Switch to { compact ? 'list' : 'compact' } view</span>
            </MobileButton>
          </li>
          { subredditLinks }
          <li className={'SideNav-dropdown' + (isAbout ? ' opened' : '')}>
            <MobileButton className='SideNav-button' onClick={this._onTwirlyClick.bind(this, 'about')}>
              <TwirlyIcon altered={isAbout}/>
              <span className='SideNav-text'>About reddit</span>
            </MobileButton>
            <ul className='SideNav-ul list-unstyled'>
              <li>
                <MobileButton className='SideNav-button' href='https://www.reddit.com/blog/'>
                  <SnooIcon/>
                  <span className='SideNav-text'>Blog</span>
                </MobileButton>
              </li>
              <li>
                <MobileButton className='SideNav-button' href='https://www.reddit.com/about/'>
                  <SnooIcon/>
                  <span className='SideNav-text'>About</span>
                </MobileButton>
              </li>
              <li>
                <MobileButton className='SideNav-button' href='https://www.reddit.com/about/team/'>
                  <SnooIcon/>
                  <span className='SideNav-text'>Team</span>
                </MobileButton>
              </li>
              <li>
                <MobileButton className='SideNav-button' href='https://www.reddit.com/code/'>
                  <SnooIcon/>
                  <span className='SideNav-text'>Source Code</span>
                </MobileButton>
              </li>
              <li>
                <MobileButton className='SideNav-button' href='https://www.reddit.com/advertising/'>
                  <SnooIcon/>
                  <span className='SideNav-text'>Advertise</span>
                </MobileButton>
              </li>
              <li>
                <MobileButton className='SideNav-button' href='https://www.reddit.com/r/redditjobs/'>
                  <SnooIcon/>
                  <span className='SideNav-text'>Jobs</span>
                </MobileButton>
              </li>
              <li>
                <MobileButton className='SideNav-button' href='https://www.reddit.com/wiki/'>
                  <SnooIcon/>
                  <span className='SideNav-text'>Wiki</span>
                </MobileButton>
              </li>
              <li>
                <MobileButton className='SideNav-button' href='https://www.reddit.com/wiki/faq'>
                  <SnooIcon/>
                  <span className='SideNav-text'>FAQ</span>
                </MobileButton>
              </li>
              <li>
                <MobileButton className='SideNav-button' href='https://www.reddit.com/wiki/reddiquette'>
                  <SnooIcon/>
                  <span className='SideNav-text'>Reddiquette</span>
                </MobileButton>
              </li>
              <li>
                <MobileButton className='SideNav-button' href='https://www.reddit.com/rules/'>
                  <SnooIcon/>
                  <span className='SideNav-text'>Rules</span>
                </MobileButton>
              </li>
              <li>
                <MobileButton className='SideNav-button' href='https://www.reddit.com/help/useragreement'>
                  <SnooIcon/>
                  <span className='SideNav-text'>User Agreement</span>
                </MobileButton>
              </li>
              <li>
                <MobileButton className='SideNav-button' href='https://www.reddit.com/help/privacypolicy'>
                  <SnooIcon/>
                  <span className='SideNav-text'>Privacy Policy</span>
                </MobileButton>
              </li>
              <li>
                <MobileButton className='SideNav-button' href='https://www.reddit.com/contact/'>
                  <SnooIcon/>
                  <span className='SideNav-text'>Contact Us</span>
                </MobileButton>
              </li>
            </ul>
          </li>
          <li>
            <MobileButton className='SideNav-button' href='http://www.reddit.com/'>
              <SnooIcon/>
              <span className='SideNav-text'>View Desktop Site</span>
            </MobileButton>
          </li>
        </ul>
      </nav>
    );
  }

  _toggle() {
    this.props.app.emit(constants.SIDE_NAV_TOGGLE, !this.state.opened);
    if(!this.state.opened) {
      this._top = document.body.scrollTop;
      window.addEventListener('scroll', this._onScroll);
    } else {
      window.removeEventListener('scroll', this._onScroll);
    }
    this.setState({opened: !this.state.opened});
  }

  _onScroll(evt) {
    document.body.scrollTop = this._top;
  }

  _close() {
    if (this.state.opened) {
      window.removeEventListener('scroll', this._onScroll);
      this.props.app.emit(constants.SIDE_NAV_TOGGLE, false);
      this.setState({opened: false});
    }
  }

  _onTwirlyClick(str) {
    this.setState({twirly: this.state.twirly === str ? '' : str}, this._heightsChanged.bind(this, this._findHeights()));
  }

  _findHeights() {
    var uls = React.findDOMNode(this).querySelectorAll('.SideNav-ul');
    var heights = [];
    for(var i = 0, iLen = uls.length; i < iLen; i++) {
      var ul = uls[i];
      var tween = TweenLite.getTweensOf(ul)[0];
      if(tween) {
        tween.pause();
      }
      var height = ul.style.height;
      ul.style.height = ''
      heights.push(uls[i].offsetHeight);
      ul.style.height = height;
      if(tween) {
        tween.resume();
      }
    }
    return heights;
  }

  _heightsChanged(oldHeights) {
    var newHeights = this._findHeights();
    var uls = React.findDOMNode(this).querySelectorAll('.SideNav-ul');
    for(var i = 0, iLen = uls.length; i < iLen; i++) {
      if(newHeights[i] !== oldHeights[i]) {
        var ul = uls[i];
        TweenLite.fromTo(ul, 0.3, {height: ul.style.height || oldHeights[i]}, {height: newHeights[i], ease: Cubic.easeInOut, clearProps: 'all'});
      }
    }
  }

  _onViewClick() {
    var app = this.props.app;

    var compact = this.state.compact;
    document.cookie = 'compact=' + (!compact) + '; expires=Fri, 31 Dec 2020 23:59:59 GMT';

    app.emit(constants.COMPACT_TOGGLE, !compact);
    this._close();

    this.setState({
      compact: !compact,
    });
  }
}

function SideNavFactory(app) {
  MobileButton = MobileButtonFactory(app);
  MailIcon = MailIconFactory(app);
  SettingsIcon = SettingsIconFactory(app);
  SnooIcon = SnooIconFactory(app);
  TwirlyIcon = TwirlyIconFactory(app);
  return app.mutate('core/components/SideNav', SideNav);
}

export default SideNavFactory;
