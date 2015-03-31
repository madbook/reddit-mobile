import React from 'react/addons';
import constants from '../../constants';
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

function shorten(text, len) {
  if (text.length > 15) {
    text = text.substr(0, Math.min(13, len-2)) + '…';
  }

  return text;
}

class TopNav extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      subredditName: props.subredditName,
      rollover: '',
      sideNavOpen: false,
    };

    this._changeSubredditName = this._changeSubredditName.bind(this);
    this._onToggle = this._onToggle.bind(this);
    this._onMouseLeave = this._onMouseLeave.bind(this);
  }

  componentDidMount() {
    this.props.app.on(constants.TOP_NAV_SUBREDDIT_CHANGE, this._changeSubredditName);
    this.props.app.on(constants.SIDE_NAV_TOGGLE, this._onToggle);
  }

  componentWillUnmount() {
    this.props.app.off(constants.TOP_NAV_SUBREDDIT_CHANGE, this._changeSubredditName);
    this.props.app.off(constants.SIDE_NAV_TOGGLE, this._onToggle);
  }

  render() {
    var subredditName = shorten(this.state.subredditName || '', 20);
    if (subredditName) {
      var breadcrumbLink = '/r/'+this.state.subredditName;
      var breadcrumbContents = /r/ + subredditName;
    } else {
      breadcrumbLink = '/';
      breadcrumbContents = <Logo played={this.state.rollover === 'breadcrumb'}/>;
    }

    return (
      <nav className='TopNav shadow'>
        <div className='pull-left TopNav-padding'>
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
        </div>
        <div className='pull-right TopNav-padding'>
          <MobileButton className='TopNav-floaty TopNav-post' over={this._onMouseEnter.bind(this, 'post')} out={this._onMouseLeave} onClick={this._onClick.bind(this, 'post')}>
            <PostIcon played={this.state.rollover === 'post'}/>
          </MobileButton>
          <MobileButton className='TopNav-floaty TopNav-search' over={this._onMouseEnter.bind(this, 'search')} out={this._onMouseLeave} onClick={this._onClick.bind(this, 'search')}>
            <SearchIcon played={this.state.rollover === 'search'}/>
          </MobileButton>
        </div>
      </nav>
   );
  }

  _changeSubredditName(str) {
    this.setState({subredditName: str});
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
  return app.mutate('core/components/TopNav', TopNav);
}

export default TopNavFactory;
