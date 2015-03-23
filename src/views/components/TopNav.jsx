import React from 'react/addons';
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
// import SideNavFactory from '../components/SideNav';
// var SideNav;

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
  }

  componentDidMount() {
    this.props.app.on(TopNav.SUBREDDIT_NAME, this._changeSubredditName);
    // this.props.app.on(SideNav.TOGGLE, this._onToggle);
    this.props.app.on('sideNavToggle', this._onToggle);
  }

  componentWillUnmount() {
    this.props.app.off(TopNav.SUBREDDIT_NAME, this._changeSubredditName);
    // this.props.app.off(SideNav.TOGGLE, this._onToggle);
    this.props.app.off('sideNavToggle', this._onToggle);
  }

  render() {
    var subredditName = shorten(this.state.subredditName || '', 20);
    if (subredditName) {
      var subredditBreadcrumb = <a className='TopNav-a' href={'/r/'+this.state.subredditName}>/r/{subredditName}</a>;
    } else {
      subredditBreadcrumb = <a className='TopNav-a' href='/'><Logo/></a>;
    }

    return (
      <nav className='TopNav shadow'>
        <div className='pull-left TopNav-padding'>
          <MobileButton className='TopNav-floaty' onClick={this._onClick.bind(this, 'hamburger')} over={this._onMouseEnter.bind(this, 'hamburger')} out={this._onMouseLeave.bind(this, 'hamburger')}>
            <HamburgerIcon hovered={this.state.rollover === 'hamburger'} opened={this.state.sideNavOpen}/>
          </MobileButton>
          <h1 className='TopNav-text TopNav-floaty'>
            <span className='TopNavHeadline'>{subredditBreadcrumb}</span>
          </h1>
        </div>
        <div className='pull-right TopNav-padding'>
          <MobileButton className='TopNav-floaty' over={this._onMouseEnter.bind(this, 'post')} out={this._onMouseLeave.bind(this, 'post')} onClick={this._onClick.bind(this, 'post')}>
            <PostIcon opened={this.state.rollover === 'post'}/>
          </MobileButton>
          <MobileButton className='TopNav-floaty' over={this._onMouseEnter.bind(this, 'search')} out={this._onMouseLeave.bind(this, 'search')} onClick={this._onClick.bind(this, 'search')}>
            <SearchIcon opened={this.state.rollover === 'search'}/>
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
        this.props.app.emit(TopNav.HAMBURGER_CLICK);
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

TopNav.HAMBURGER_CLICK = 'topNavHamburgerClick';
TopNav.SUBREDDIT_NAME = 'topNavSubredditName';

function TopNavFactory(app) {
  // SideNav = SideNavFactory(app);
  SnooButton = SnooButtonFactory(app);
  PostIcon = PostIconFactory(app);
  SearchIcon = SearchIconFactory(app);
  HamburgerIcon = HamburgerIconFactory(app);
  MobileButton = MobileButtonFactory(app);
  Logo = LogoFactory(app);
  return app.mutate('core/components/TopNav', TopNav);
}

export default TopNavFactory;
