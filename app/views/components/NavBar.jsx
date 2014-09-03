/** @jsx React.DOM */

var React = require('react');

var NavBar = React.createClass({
  render: function() {
    var user = this.props.session ? this.props.session.user : undefined;
    var loginLink;

    if (user) {
      loginLink = (
        <li><a href={ '/u/' + user.name }>{ user.name }</a></li>
      );
    } else {
      loginLink = (
        <li><a href='/login'>login / register</a></li>
      );
    }

    return (
      <nav className='navbar navbar-default' role='navigation'>
        <div className='container-fluid'>
          <div className='navbar-header'>
            <button type='button' className='navbar-toggle' data-toggle='collapse' data-target='#bs-example-navbar-collapse-1'>
              <span className='sr-only'>Toggle navigation</span>
              <span className='icon-bar'></span>
              <span className='icon-bar'></span>
              <span className='icon-bar'></span>
            </button>
            <a className='navbar-brand' href='/'>reddit</a>
          </div>

          <div className='collapse navbar-collapse' id='bs-example-navbar-collapse-1'>
            <ul className='nav navbar-nav navbar-right'>
              { loginLink }
              <li><a href='#'>english</a></li>

              <li className='dropdown'>
                <a href='#' className='dropdown-toggle' data-toggle='dropdown'>about <span className='caret'></span></a>
                <ul className='dropdown-menu' role='menu'>
                  <li>
                    <a href='https://www.reddit.com/blog/'>blog</a>
                  </li>
                  <li>
                    <a href='https://www.reddit.com/about/'>about</a>
                  </li>
                  <li>
                    <a href='https://www.reddit.com/about/team/'>team</a>
                  </li>
                  <li>
                    <a href='https://www.reddit.com/code/'>source code</a>
                  </li>
                  <li>
                    <a href='https://www.reddit.com/advertising/'>advertise</a>
                  </li>
                  <li>
                    <a href='https://www.reddit.com/r/redditjobs/'>jobs</a>
                  </li>
                </ul>
              </li>

              <li className='dropdown'>
                <a href='#' className='dropdown-toggle' data-toggle='dropdown'>help <span className='caret'></span></a>
                <ul className='dropdown-menu' role='menu'>
                  <li>
                    <a href='https://www.reddit.com/wiki/'>wiki</a>
                  </li>
                  <li>
                    <a href='https://www.reddit.com/wiki/faq'>FAQ</a>
                  </li>
                  <li>
                    <a href='https://www.reddit.com/wiki/reddiquette'>reddiquette</a>
                  </li>
                  <li>
                    <a href='https://www.reddit.com/rules/'>rules</a>
                  </li>
                  <li>
                    <a href='https://www.reddit.com/contact/'>contact us</a>
                  </li>
                </ul>
              </li>

              <li className='dropdown'>
                <a href='#' className='dropdown-toggle' data-toggle='dropdown'>tools <span className='caret'></span></a>
                <ul className='dropdown-menu' role='menu'>
                  <li>
                    <a href='https://i.reddit.com'>mobile</a>
                  </li>
                  <li>
                    <a href='https://addons.mozilla.org/firefox/addon/socialite/'>firefox extension</a>
                  </li>
                  <li>
                    <a href='https://chrome.google.com/webstore/detail/algjnflpgoopkdijmkalfcifomdhmcbe'>chrome extension</a>
                  </li>
                  <li>
                    <a href='https://www.reddit.com/buttons/'>buttons</a>
                  </li>
                  <li>
                    <a href='https://www.reddit.com/widget/'>widget</a>
                  </li>
                </ul>
              </li>

              <li className='dropdown'>
                <a href='#' className='dropdown-toggle' data-toggle='dropdown'>&lt;3 <span className='caret'></span></a>
                <ul className='dropdown-menu' role='menu'>
                  <li>
                    <a href='https://www.reddit.com/gold/about/' className='buygold choice'>reddit gold</a>
                  </li>
                  <li>
                    <a href='https://www.reddit.com/store/'>store</a>
                  </li>
                  <li>
                    <a href='https://redditgifts.com'>redditgifts</a>
                  </li>
                  <li>
                    <a href='https://reddit.tv'>reddit.tv</a>
                  </li>
                  <li>
                    <a href='https://radioreddit.com'>radio reddit</a>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }
});

module.exports = NavBar;

