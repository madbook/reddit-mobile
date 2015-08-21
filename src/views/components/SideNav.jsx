import React from 'react/addons';
import constants from '../../constants';
import cookies from 'cookies-js';
import propTypes from '../../propTypes';
import querystring from 'querystring';

import BaseComponent from './BaseComponent';

var CSSTransitionGroup = React.addons.CSSTransitionGroup;
var TransitionGroup = React.addons.TransitionGroup;

var snooIcon = (
  <span className='icon-snoo-circled icon-large'>{' '}</span>
);
var settingsIcon = (
  <span className='icon-settings-circled icon-large'>{' '}</span>
);
var saveIcon = (
  <span className='icon-save-circled icon-large'>{' '}</span>
);
var mailIcon = (
  <span className='icon-mail-circled icon-large'>{' '}</span>
);

class SideNav extends BaseComponent {
  constructor(props) {
    super(props);

    this.state = {
      opened: false,
      twirly: '',
      compact: props.compact,
      subscriptions: props.dataCache.userSubscriptions || [],
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
    this.props.app.on(constants.TOP_NAV_HAMBURGER_CLICK, this._toggle);
    this.props.app.on('route:start', this._close);

    if (!this.state.subscriptions) {
      this.props.data.get('subscriptions').then(function(s) {
        this.setState({
          subscriptions: s.data,
        });
      });
    }
  }

  componentWillUnmount() {
    this.props.app.off(constants.TOP_NAV_HAMBURGER_CLICK, this._toggle);
    this.props.app.off('route:start', this._close);
  }

  _desktopSite(e) {
    e.preventDefault();
    var url = this.props.ctx.url;
    var query = '';

    if (Object.keys(this.props.ctx.query).length > 0) {
      query = '?' + querystring.stringify(this.props.ctx.query || {});
    }

    this.props.app.emit('route:desktop', `${url}${query}`);
  }

  _goto(e) {
    e.preventDefault();

    let textEl = this.refs.location.getDOMNode();
    let location = textEl.value.trim();

    let query = querystring.stringify({ location });

    let url = `/goto?${query}`;
    this.props.app.redirect(url);
  }

  render() {
    if (this.state.opened) {
      var user = this.props.user;
      var loginLink;
      var inboxLink;
      var compact = this.state.compact;

      var twirly = this.state.twirly;

      if (user) {
        if (twirly === 'user') {
          var userButtons = (
            <ul key='user' className='SideNav-ul list-unstyled'>
              <li className='MobileButton SideNav-li'>
                <a className='SideNav-button' href={ `/u/${user.name}` }>
                  { snooIcon }
                  <span className='SideNav-text'>My Profile</span>
                </a>
              </li>
              <li className='SideNav-li'>
                <a className='MobileButton SideNav-button' href={ `/u/${user.name}/saved` }>
                  { saveIcon }
                  <span className='SideNav-text'>Saved</span>
                </a>
              </li>
              <li className='SideNav-li'>
                <a className='MobileButton SideNav-button' href={ `/u/${user.name}/hidden` }>
                  { settingsIcon }
                  <span className='SideNav-text'>Hidden</span>
                </a>
              </li>
              <li>
                <a className='MobileButton SideNav-button' href='/logout' data-no-route={ true }>
                  { snooIcon }
                  <span className='SideNav-text'>Log out</span>
                </a>
              </li>
            </ul>
          );
        }

        loginLink = (
          <li className='SideNav-dropdown SideNav-li'>
            <button type='button' className='MobileButton SideNav-button' onClick={this._onTwirlyClick.bind(this, 'user')}>
              <span className={ twirly === 'user' ? 'twirlyIcon-open' : 'twirlyIcon-closed'}>
                <span className='icon-twirly-circled icon-large'>{' '}</span>
              </span>
              <span className='SideNav-text'>{ user.name }</span>
            </button>
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
            <a className={`MobileButton SideNav-button ${newClass}`} href='/message/inbox/'>
              { mailIcon }
              <span className='SideNav-text'>Inbox{newMail}</span>
            </a>
          </li>
        );
      } else {
        loginLink = (
          <li className='SideNav-li'>
            <a className='MobileButton SideNav-button' href={ this.props.app.config.loginPath } data-no-route={ true }>
              { snooIcon }
              <span className='SideNav-text'>Login / Register</span>
            </a>
          </li>
        );
      }

      if (twirly === 'subreddits') {
        var subreddits = this.state.subscriptions || [];
        var subredditNodeList = subreddits.map((d) => {
          if(d.icon) {
            var icon = <figure className='SideNav-icon' style={{backgroundImage: 'url(' + d.icon + ')'}}/>;
          } else {
            icon = snooIcon;
          }
          return (
            <li className='SideNav-li' key={`SideNav-li-${d.url}`}>
              <a className='MobileButton SideNav-button' href={ d.url }>
                {icon}
                <span className='SideNav-text'>{d.display_name}</span>
              </a>
            </li>
          );
        });
        var subredditButtons = (
          <ul key='subreddits' className='SideNav-ul list-unstyled'>
            { subredditNodeList }
          </ul>
        );
      }

      var subredditLinks = (
        <li className='SideNav-dropdown SideNav-li'>
          <button type='button' className='MobileButton SideNav-button' onClick={this._onTwirlyClick.bind(this, 'subreddits')}>
            <span className={ twirly === 'subreddits' ? 'twirlyIcon-open' : 'twirlyIcon-closed'}>
              <span className='icon-twirly-circled icon-large'>{' '}</span>
            </span>
            <span className='SideNav-text'>My Subreddits</span>
          </button>
          <TransitionGroup>
            { subredditButtons }
          </TransitionGroup>
        </li>
      );

      if (twirly === 'about') {
        var aboutButtons = (
          <ul key='about' className='SideNav-ul list-unstyled'>
            <li className='SideNav-li'>
              <a className='SideNav-button' href='https://www.reddit.com/blog/'>
                { snooIcon }
                <span className='SideNav-text'>Blog</span>
              </a>
            </li>
            <li className='SideNav-li'>
              <a className='SideNav-button' href='https://www.reddit.com/about/'>
                { snooIcon }
                <span className='SideNav-text'>About</span>
              </a>
            </li>
            <li className='SideNav-li'>
              <a className='SideNav-button' href='https://www.reddit.com/about/team/'>
                { snooIcon }
                <span className='SideNav-text'>Team</span>
              </a>
            </li>
            <li className='SideNav-li'>
              <a className='SideNav-button' href='https://www.reddit.com/code/'>
                { snooIcon }
                <span className='SideNav-text'>Source Code</span>
              </a>
            </li>
            <li className='SideNav-li'>
              <a className='SideNav-button' href='https://www.reddit.com/advertising/'>
                { snooIcon }
                <span className='SideNav-text'>Advertise</span>
              </a>
            </li>
            <li className='SideNav-li'>
              <a className='SideNav-button' href='https://www.reddit.com/r/redditjobs/'>
                { snooIcon }
                <span className='SideNav-text'>Jobs</span>
              </a>
            </li>
            <li className='SideNav-li'>
              <a className='SideNav-button' href='https://www.reddit.com/wiki/'>
                { snooIcon }
                <span className='SideNav-text'>Wiki</span>
              </a>
            </li>
            <li className='SideNav-li'>
              <a className='SideNav-button' href='https://www.reddit.com/wiki/faq'>
                { snooIcon }
                <span className='SideNav-text'>FAQ</span>
              </a>
            </li>
            <li className='SideNav-li'>
              <a className='SideNav-button' href='https://www.reddit.com/wiki/reddiquette'>
                { snooIcon }
                <span className='SideNav-text'>Reddiquette</span>
              </a>
            </li>
            <li className='SideNav-li'>
              <a className='SideNav-button' href='https://www.reddit.com/rules/'>
                { snooIcon }
                <span className='SideNav-text'>Rules</span>
              </a>
            </li>
            <li className='SideNav-li'>
              <a className='SideNav-button' href='https://www.reddit.com/help/useragreement'>
                { snooIcon }
                <span className='SideNav-text'>User Agreement</span>
              </a>
            </li>
            <li className='SideNav-li'>
              <a className='SideNav-button' href='https://www.reddit.com/help/privacypolicy'>
                { snooIcon }
                <span className='SideNav-text'>Privacy Policy</span>
              </a>
            </li>
            <li className='SideNav-li'>
              <a className='SideNav-button' href='https://www.reddit.com/contact/'>
                { snooIcon }
                <span className='SideNav-text'>Contact Us</span>
              </a>
            </li>
          </ul>
        );
      }

      var node = (
        <nav key='root' className='SideNav tween shadow'>
          <ul className='list-unstyled'>
            <li className='SideNav-li '>
              <form method='GET' action='/goto' onSubmit={ this._goto } className='form-sm'>
                <div className='input-group'>
                  <input type='text' className='form-control form-control-sm' placeholder='r/...' name='location' ref='location' />
                  <span className='input-group-btn'>
                    <button type='submit' className='btn btn-default go-btn'>Go</button>
                  </span>
                </div>
              </form>
            </li>
            { loginLink }
            { inboxLink }
            <li className='SideNav-li'>
              <button type='button' className='SideNav-button' onClick={this._onViewClick}>
                { settingsIcon }
                <span className='SideNav-text'>Switch to { compact ? 'list' : 'compact' } view</span>
              </button>
            </li>
            { subredditLinks }
            <li className='SideNav-dropdown SideNav-li'>
              <button type='button' className='SideNav-button' onClick={this._onTwirlyClick.bind(this, 'about')}>
                <span className={ twirly === 'about' ? 'twirlyIcon-open' : 'twirlyIcon-closed'}>
                  <span className='icon-twirly-circled icon-large'>{' '}</span>
                </span>
                <span className='SideNav-text'>About reddit</span>
              </button>
              <TransitionGroup>
                { aboutButtons }
              </TransitionGroup>
            </li>
            <li className='SideNav-li'>
              <a className='SideNav-button' href={`https://www.reddit.com${this.props.ctx.url}`} onClick={ this._desktopSite }>
                { snooIcon }
                <span className='SideNav-text'>View Desktop Site</span>
              </a>
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
    this.props.app.emit(constants.SIDE_NAV_TOGGLE, !opened);
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
      this.props.app.emit(constants.SIDE_NAV_TOGGLE, false);
      this.setState({opened: false});
    }
  }

  _onTwirlyClick(str) {
    this.setState({twirly: this.state.twirly === str ? '' : str});
  }

  _onViewClick() {
    var app = this.props.app;
    var config = this.props.config;
    var compact = this.state.compact;
    let date = new Date();
    date.setFullYear(date.getFullYear() + 2);

    if (compact) {
      cookies.expire('compact');
    } else {
      cookies.set('compact', 'true', {
        expires: date,
        secure: config.https || config.httpsProxy,
      });
    }

    var newCompact = !compact;
    app.emit(constants.COMPACT_TOGGLE, newCompact);

    this._close();
    this.setState({
      compact: newCompact,
      show: false,
    });
  }
}

SideNav.propTypes = {
  subscriptions: propTypes.subscriptions,
};

export default SideNav;
