import React from 'react';
import constants from '../../constants';

class SideNav extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      opened: false,
      twirly: '',
    };

    this._onTwirlyClick = this._onTwirlyClick.bind(this);
    this._toggle = this._toggle.bind(this);
    this._close = this._close.bind(this);
  }

  componentDidMount() {
    this.props.app.on(constants.TOP_NAV_HAMBURGER_CLICK, this._toggle);
    this.props.app.on('route:start', this._close);
  }

  componentWillUnount() {
    this.props.app.off(constants.TOP_NAV_HAMBURGER_CLICK, this._toggle);
    this.props.app.off('route:start', this._close);
  }

  render() {
    var user = this.props.user;
    var loginLink;
    var logoutLink;

    if (user) {
      loginLink = (
        <li>
          <a className='SideNav-button' href={ '/u/' + user.name }>{ user.name }</a>
        </li>
      );

      logoutLink = (
        <li>
          <a className='SideNav-button' href='/logout' data-no-route='true'>Log out</a>
        </li>
      );
    }

    return (
      <nav className={'SideNav tween' + (this.state.opened?' opened':'')}>
        <ul className='SideNav-ul list-unstyled'>
          <li>
            <a className='SideNav-button' href='/'>Home</a>
          </li>

          { loginLink }
          { logoutLink }

          <li className={'SideNav-dropdown tween'+(this.state.twirly === 'about' ? ' opened' : '')}>
            <button className={'twirly before SideNav-button'+(this.state.twirly === 'about' ? ' opened' : '')} onClick={this._onTwirlyClick.bind(this, 'about')}>About</button>
            <ul className='SideNav-ul list-unstyled'>
              <li>
                <a className='SideNav-button' href='https://www.reddit.com/blog/'>Blog</a>
              </li>
              <li>
                <a className='SideNav-button' href='https://www.reddit.com/about/'>About</a>
              </li>
              <li>
                <a className='SideNav-button' href='https://www.reddit.com/about/team/'>Team</a>
              </li>
              <li>
                <a className='SideNav-button' href='https://www.reddit.com/code/'>Source Code</a>
              </li>
              <li>
                <a className='SideNav-button' href='https://www.reddit.com/advertising/'>Advertise</a>
              </li>
              <li>
                <a className='SideNav-button' href='https://www.reddit.com/r/redditjobs/'>Jobs</a>
              </li>
            </ul>
          </li>

          <li className={'SideNav-dropdown tween' + (this.state.twirly === 'help' ? ' opened' : '')}>
            <button className={'twirly before SideNav-button' + (this.state.twirly === 'help' ? ' opened' : '')} onClick={this._onTwirlyClick.bind(this, 'help')}>Help</button>
            <ul className='SideNav-ul list-unstyled'>
              <li>
                <a className='SideNav-button' href='https://www.reddit.com/wiki/'>Wiki</a>
              </li>
              <li>
                <a className='SideNav-button' href='https://www.reddit.com/wiki/faq'>FAQ</a>
              </li>
              <li>
                <a className='SideNav-button' href='https://www.reddit.com/wiki/reddiquette'>Reddiquette</a>
              </li>
              <li>
                <a className='SideNav-button' href='https://www.reddit.com/rules/'>Rules</a>
              </li>
              <li>
                <a className='SideNav-button' href='https://www.reddit.com/help/useragreement'>User Agreement</a>
              </li>
              <li>
                <a className='SideNav-button' href='https://www.reddit.com/help/privacypolicy'>Privacy Policy</a>
              </li>
              <li>
                <a className='SideNav-button' href='https://www.reddit.com/contact/'>Contact Us</a>
              </li>
            </ul>
          </li>
          <li>
            <a className='SideNav-button' href='https://www.reddit.com'>Desktop view</a>
          </li>
          <li>
            <a className='SideNav-button' href='/faq'>Mobile Beta FAQ</a>
          </li>
        </ul>
      </nav>
    );
  }

  _toggle() {
    this.props.app.emit(constants.SIDE_NAV_TOGGLE, !this.state.opened);
    this.setState({opened: !this.state.opened});
  }

  _close() {
    if (this.state.opened) {
      this.props.app.emit(constants.SIDE_NAV_TOGGLE, false);
      this.setState({opened: false});
    }
  }

  _onTwirlyClick(str) {
    this.setState({twirly: this.state.twirly === str ? '' : str});
  }
}

function SideNavFactory(app) {
  return app.mutate('core/components/SideNav', SideNav);
}

export default SideNavFactory;
