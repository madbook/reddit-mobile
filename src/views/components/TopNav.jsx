import React from 'react';
import SnooButtonFactory from '../components/SnooButton';
import PostButtonFactory from '../components/PostButton';
import SearchButtonFactory from '../components/SearchButton';

var SnooButton;
var PostButton;
var SearchButton;

function shorten (text, len) {
  if (text.length > 15) {
    text = text.substr(0, Math.min(13,len-2)) + '…';
  }

  return text;
}

class TopNav extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      subredditName:''
    };

    this._onHamburgerClick = this._onHamburgerClick.bind(this);
    this._changeSubredditName = this._changeSubredditName.bind(this);

  }

  componentDidMount () {
    this.props.app.on(TopNav.SUBREDDIT_NAME, this._changeSubredditName);
  }

  render() {
    var subredditName = shorten(this.state.subredditName || '', 20);
    if(subredditName)
      var subredditBreadcrumb = <a href={'/r/'+subredditName}>{subredditName}</a>;
    else
      subredditBreadcrumb = <a href='/'>reddit</a>;

    return (
      <nav className='TopNav'>
        <div className='pull-left'>
          <button className='hamburger floaty' onClick={this._onHamburgerClick}>
            <div></div>
          </button>
          <SnooButton/>
          <h1 className='text floaty'>
              <span>{subredditBreadcrumb}</span>
          </h1>
        </div>
        <div className='pull-right'>
          <PostButton/>
          <SearchButton/>
        </div>
      </nav>
    );
  }

  _onHamburgerClick() {
    this.props.app.emit(TopNav.HAMBURGER_CLICK);
  }

  _changeSubredditName(str) {
    this.setState({subredditName:str});
  }
}

TopNav.HAMBURGER_CLICK = 'topNavHamburgerClick';
TopNav.SUBREDDIT_NAME = 'topNavSubredditName';

function TopNavFactory(app) {
  SnooButton = SnooButtonFactory(app);
  PostButton = PostButtonFactory(app);
  SearchButton = SearchButtonFactory(app);
  return app.mutate('core/components/topNav', TopNav);
}

export default TopNavFactory;
