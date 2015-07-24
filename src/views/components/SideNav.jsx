import React from 'react/addons';
import constants from '../../constants';
import cookies from 'cookies-js';
import globals from '../../globals';
import querystring from 'querystring';

import AutoTween from '../components/AutoTween';
import BaseComponent from './BaseComponent';
import MailIcon from '../components/icons/MailIcon';
import MobileButton from '../components/MobileButton';
import SaveIcon from '../components/icons/SaveIcon';
import SettingsIcon from '../components/icons/SettingsIcon';
import TwirlyIcon from '../components/icons/TwirlyIcon';

var CSSTransitionGroup = React.addons.CSSTransitionGroup;
var TransitionGroup = React.addons.TransitionGroup;
var snooIcon = (
  <span className='icon-snoo-circled icon-large'>{' '}</span>
);

class SideNav extends BaseComponent {
  constructor(props) {
    super(props);

    this.state = {
      opened: false,
      twirly: '',
      compact: globals().compact,
    };

    this._onTwirlyClick = this._onTwirlyClick.bind(this);
    this._toggle = this._toggle.bind(this);
    this._close = this._close.bind(this);
    this._onViewClick = this._onViewClick.bind(this);
    this._onScroll = this._onScroll.bind(this);
    this._desktopSite = this._desktopSite.bind(this);
    this._goto = this._goto.bind(this);
  }

  componentDidMount() {
    globals().app.on(constants.TOP_NAV_HAMBURGER_CLICK, this._toggle);
    globals().app.on('route:start', this._close);
  }

  componentWillUnmount() {
    globals().app.off(constants.TOP_NAV_HAMBURGER_CLICK, this._toggle);
    globals().app.off('route:start', this._close);
  }

  _desktopSite(e) {
    e.preventDefault();
    var url = globals().url;
    var query = '';

    if (Object.keys(this.props.query).length > 0) {
      query = '?' + querystring.stringify(this.props.query || {});
    }

    globals().app.emit('route:desktop', `${url}${query}`);
  }

  _goto(e) {
    e.preventDefault();

    let textEl = this.refs.location.getDOMNode();
    let location = textEl.value.trim();

    let query = querystring.stringify({ location });

    let url = `/goto?${query}`;
    globals().app.redirect(url);
  }

  render() {
    if (this.state.opened) {
      var user = this.props.user;
      var loginLink;
      var inboxLink;
      var compact = this.state.compact;

      var twirly = this.state.twirly;
      var isAbout = twirly === 'about';
      var isSubreddits = twirly === 'subreddits';
      var isUser = twirly === 'user';

      if (user) {
        if (isUser) {
          var userButtons = (
            <AutoTween component='ul' key='user' className='SideNav-ul list-unstyled'>
              <li className='SideNav-li'>
                <MobileButton className='SideNav-button' href={ `/u/${user.name}` }>
                  { snooIcon }
                  <span className='SideNav-text'>My Profile</span>
                </MobileButton>
              </li>
              <li className='SideNav-li'>
                <MobileButton className='SideNav-button' href={ `/u/${user.name}/saved` }>
                  <SaveIcon/>
                  <span className='SideNav-text'>Saved</span>
                </MobileButton>
              </li>
              <li className='SideNav-li'>
                <MobileButton className='SideNav-button' href={ `/u/${user.name}/hidden` }>
                  <SettingsIcon/>
                  <span className='SideNav-text'>Hidden</span>
                </MobileButton>
              </li>
              <li>
                <MobileButton className='SideNav-button' href='/logout' noRoute='true'>
                  { snooIcon }
                  <span className='SideNav-text'>Log out</span>
                </MobileButton>
              </li>
            </AutoTween>
          );
        }

        loginLink = (
          <li className='SideNav-dropdown SideNav-li'>
            <MobileButton className='SideNav-button' onClick={this._onTwirlyClick.bind(this, 'user')}>
              <TwirlyIcon altered={isUser}/>
              <span className='SideNav-text'>{ user.name }</span>
            </MobileButton>
            <TransitionGroup>
              { userButtons }
            </TransitionGroup>
          </li>
        );

        var inboxCount = user.inbox_count;
        let newMail;
        let newClass;

        if(inboxCount > 0) {
          newMail = (<strong>{` (${inboxCount})`}</strong>);
          newClass = 'text-orangered';
        }

        inboxLink = (
          <li className='SideNav-li'>
            <MobileButton className={`SideNav-button ${newClass}`} href='/message/inbox/'>
              <MailIcon/>
              <span className='SideNav-text'>Inbox{newMail}</span>
            </MobileButton>
          </li>
        );
      } else {
        loginLink = (
          <li className='SideNav-li'>
            <MobileButton className='SideNav-button' href={ globals().loginPath } noRoute='true'>
              { snooIcon }
              <span className='SideNav-text'>Login / Register</span>
            </MobileButton>
          </li>
        );
      }

      if (isSubreddits) {
        var subreddits = this.props.subscriptions || [];
        var subredditNodeList = subreddits.map((d) => {
          if(d.icon) {
            var icon = <figure className='SideNav-icon' style={{backgroundImage: 'url(' + d.icon + ')'}}/>;
          } else {
            icon = { snooIcon }
          }
          return (
            <li className='SideNav-li' key={`SideNav-li-${d.url}`}>
              <MobileButton className='SideNav-button' href={ d.url }>
                {icon}
                <span className='SideNav-text'>{d.display_name}</span>
              </MobileButton>
            </li>
          );
        });
        var subredditButtons = (
          <AutoTween key='subreddits' className='SideNav-ul list-unstyled'>
            { subredditNodeList }
          </AutoTween>
        );
      }

      var subredditLinks = (
        <li className='SideNav-dropdown SideNav-li'>
          <MobileButton className='SideNav-button' onClick={this._onTwirlyClick.bind(this, 'subreddits')}>
            <TwirlyIcon altered={isSubreddits}/>
            <span className='SideNav-text'>My Subreddits</span>
          </MobileButton>
          <TransitionGroup>
            { subredditButtons }
          </TransitionGroup>
        </li>
      );

      if (isAbout) {
        var aboutButtons = (
          <AutoTween key='about' component='ul' className='SideNav-ul list-unstyled'>
            <li className='SideNav-li'>
              <MobileButton className='SideNav-button' href='https://www.reddit.com/blog/'>
                { snooIcon }
                <span className='SideNav-text'>Blog</span>
              </MobileButton>
            </li>
            <li className='SideNav-li'>
              <MobileButton className='SideNav-button' href='https://www.reddit.com/about/'>
                { snooIcon }
                <span className='SideNav-text'>About</span>
              </MobileButton>
            </li>
            <li className='SideNav-li'>
              <MobileButton className='SideNav-button' href='https://www.reddit.com/about/team/'>
                { snooIcon }
                <span className='SideNav-text'>Team</span>
              </MobileButton>
            </li>
            <li className='SideNav-li'>
              <MobileButton className='SideNav-button' href='https://www.reddit.com/code/'>
                { snooIcon }
                <span className='SideNav-text'>Source Code</span>
              </MobileButton>
            </li>
            <li className='SideNav-li'>
              <MobileButton className='SideNav-button' href='https://www.reddit.com/advertising/'>
                { snooIcon }
                <span className='SideNav-text'>Advertise</span>
              </MobileButton>
            </li>
            <li className='SideNav-li'>
              <MobileButton className='SideNav-button' href='https://www.reddit.com/r/redditjobs/'>
                { snooIcon }
                <span className='SideNav-text'>Jobs</span>
              </MobileButton>
            </li>
            <li className='SideNav-li'>
              <MobileButton className='SideNav-button' href='https://www.reddit.com/wiki/'>
                { snooIcon }
                <span className='SideNav-text'>Wiki</span>
              </MobileButton>
            </li>
            <li className='SideNav-li'>
              <MobileButton className='SideNav-button' href='https://www.reddit.com/wiki/faq'>
                { snooIcon }
                <span className='SideNav-text'>FAQ</span>
              </MobileButton>
            </li>
            <li className='SideNav-li'>
              <MobileButton className='SideNav-button' href='https://www.reddit.com/wiki/reddiquette'>
                { snooIcon }
                <span className='SideNav-text'>Reddiquette</span>
              </MobileButton>
            </li>
            <li className='SideNav-li'>
              <MobileButton className='SideNav-button' href='https://www.reddit.com/rules/'>
                { snooIcon }
                <span className='SideNav-text'>Rules</span>
              </MobileButton>
            </li>
            <li className='SideNav-li'>
              <MobileButton className='SideNav-button' href='https://www.reddit.com/help/useragreement'>
                { snooIcon }
                <span className='SideNav-text'>User Agreement</span>
              </MobileButton>
            </li>
            <li className='SideNav-li'>
              <MobileButton className='SideNav-button' href='https://www.reddit.com/help/privacypolicy'>
                { snooIcon }
                <span className='SideNav-text'>Privacy Policy</span>
              </MobileButton>
            </li>
            <li className='SideNav-li'>
              <MobileButton className='SideNav-button' href='https://www.reddit.com/contact/'>
                { snooIcon }
                <span className='SideNav-text'>Contact Us</span>
              </MobileButton>
            </li>
          </AutoTween>
        );
      }

      var node = (
        <nav key='root' className='SideNav tween shadow'>
          <ul className='list-unstyled'>
            <li className='SideNav-li SideNav-form-holder'>
              <form method='GET' action='/goto' onSubmit={ this._goto } className='form-sm form-single'>
                <div className='SideNav-input-holder'>
                  <input type='text' className='form-control zoom-fix form-control-sm' placeholder='r/...' name='location' ref='location' />
                </div>
                <button type='submit' className='btn btn-default'>Go</button>
              </form>
            </li>
            { loginLink }
            { inboxLink }
            <li className='SideNav-li'>
              <MobileButton className='SideNav-button' onClick={this._onViewClick}>
                <SettingsIcon/>
                <span className='SideNav-text'>Switch to { compact ? 'list' : 'compact' } view</span>
              </MobileButton>
            </li>
            { subredditLinks }
            <li className='SideNav-dropdown SideNav-li'>
              <MobileButton className='SideNav-button' onClick={this._onTwirlyClick.bind(this, 'about')}>
                <TwirlyIcon altered={isAbout}/>
                <span className='SideNav-text'>About reddit</span>
              </MobileButton>
              <TransitionGroup>
                { aboutButtons }
              </TransitionGroup>
            </li>
            <li className='SideNav-li'>
              <MobileButton className='SideNav-button' href={`https://www.reddit.com${globals().url}`} onClick={ this._desktopSite }>
                { snooIcon }
                <span className='SideNav-text'>View Desktop Site</span>
              </MobileButton>
            </li>
          </ul>
        </nav>
      );
    }

    return (
      <CSSTransitionGroup transitionName="SideNav">
        { node }
      </CSSTransitionGroup>
    );
  }

  _toggle() {
    var opened = this.state.opened;
    globals().app.emit(constants.SIDE_NAV_TOGGLE, !opened);
    if(!opened) {
      this._top = document.body.scrollTop;
      window.addEventListener('scroll', this._onScroll);
    } else {
      window.removeEventListener('scroll', this._onScroll);
    }
    this.setState({opened: !opened});
  }

  _onScroll(evt) {
    document.body.scrollTop = this._top;
  }

  _close() {
    if (this.state.opened) {
      window.removeEventListener('scroll', this._onScroll);
      globals().app.emit(constants.SIDE_NAV_TOGGLE, false);
      this.setState({opened: false});
    }
  }

  _onTwirlyClick(str) {
    this.setState({twirly: this.state.twirly === str ? '' : str});
  }

  _onViewClick() {
    var app = globals().app;
    var compact = this.state.compact;
    let date = new Date();
    date.setFullYear(date.getFullYear() + 2);

    if (compact) {
      cookies.expire('compact');
    } else {
      cookies.set('compact', 'true', {
        expires: date,
        secure: app.getConfig('https') || app.getConfig('httpsProxy'),
      });
    }

    var newCompact = !compact;
    globals().compact = newCompact;
    app.emit(constants.COMPACT_TOGGLE, newCompact);
    this._close();
    this.setState({
      compact: newCompact,
      show: false,
    });
  }
}

export default SideNav;
