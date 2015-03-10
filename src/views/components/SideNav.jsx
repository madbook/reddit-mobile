import React from 'react';
import TopNavFactory from '../components/TopNav';

var TopNav;

class SideNav extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      opened:false,
      twirly:''
    };

    this._onTwirlyClick = this._onTwirlyClick.bind(this);
    this._toggle = this._toggle.bind(this);
    this._close = this._close.bind(this);

    this.props.app.on(TopNav.HAMBURGER_CLICK, this._toggle);
    this.props.app.on('route:start', this._close);
  }

  render() {
    var user = this.props.user;

    if (user) {
      var loginLink = (
        <li>
          <a href={ '/u/' + user.name }>{ user.name }</a>
        </li>
      );
    } else {
      loginLink = (
        <li>
          <a href='/login' data-no-route='true'>Login / Register</a>
        </li>
      );
    }

    return (
      <nav className={'SideNav' + (this.state.opened?' opened':'')}>
      <ul>
        { loginLink }
        <li className={'dropdown'+(this.state.twirly=='about'?' opened':'')}>
          <button className={'twirly before'+(this.state.twirly=='about'?' opened':'')} onClick={this._onTwirlyClick.bind(this, 'about')}>About</button>
          <ul>
            <li>
              <a href='/blog/'>Blog</a>
            </li>
            <li>
              <a href='/about/'>About</a>
            </li>
            <li>
              <a href='/about/team/'>Team</a>
            </li>
            <li>
              <a href='/code/'>Source Code</a>
            </li>
            <li>
              <a href='/advertising/'>Advertise</a>
            </li>
            <li>
              <a href='/r/redditjobs/'>Jobs</a>
            </li>
          </ul>
        </li>
        <li className={'dropdown'+(this.state.twirly=='help'?' opened':'')}>
          <button className={'twirly before'+(this.state.twirly=='help'?' opened':'')} onClick={this._onTwirlyClick.bind(this, 'help')}>Help</button>
          <ul>
            <li>
              <a href='/wiki/'>Wiki</a>
            </li>
            <li>
              <a href='/wiki/faq'>FAQ</a>
            </li>
            <li>
              <a href='/wiki/reddiquette'>Reddiquette</a>
            </li>
            <li>
              <a href='/rules/'>Rules</a>
            </li>
            <li>
              <a href='/help/useragreement'>User Agreement</a>
            </li>
            <li>
              <a href='/help/privacypolicy'>Privacy Policy</a>
            </li>
            <li>
              <a href='/contact/'>Contact Us</a>
            </li>
          </ul>
        </li>
        </ul>
      </nav>
    );
  }

  _toggle() {
    this.setState({opened:!this.state.opened});
  }

  _close() {
    if(this.state.opened)
      this.setState({opened:false});
  }

  _onTwirlyClick(str, evt) {
    var twirly = this.state.twirly;
    this.setState({twirly:this.state.twirly == str?'':str})
  }
}

function SideNavFactory(app) {
  TopNav = TopNavFactory(app);
  return app.mutate('core/components/topNav', SideNav);
}

export default SideNavFactory;
