import React from 'react';

class NavBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      active: false,
    };
  }

  shouldComponentUpdate (nextProps, nextState) {
    return (nextProps !== this.props || nextState !== this.state);
  }

  toggleCollapse (e) {
    e.preventDefault();

    var $ = global.$;
    $(this.props.navbarCollapseTarget).toggleClass('active');

    this.setState({
      active: !this.state.active,
    });
  }

  render () {
    var user = this.props.user;
    var loginLink;
    var activeClass = '';

    if (this.state.active) {
      activeClass = 'active';
    }

    if (user) {
      loginLink = (
        <li><a href={ '/u/' + user.name }>{ user.name }</a></li>
      );
    } else {
      loginLink = (
        <li><a href='/login' data-no-route='true'>login / register</a></li>
      );
    }

    return (
      <nav role='navigation'>
        <div className={ 'container navbar-offcanvas ' + activeClass }>
          <div className='row'>
            <div className='col-xs-12'>
              <ul className='nav navbar-nav'>
                { loginLink }

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
                      <a href='https://www.reddit.com/help/useragreement'>user agreement</a>
                    </li>
                    <li>
                      <a href='https://www.reddit.com/help/privacypolicy'>privacy policy</a>
                    </li>
                    <li>
                      <a href='https://www.reddit.com/contact/'>contact us</a>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className='navbar navbar-default navbar-fixed-top'>
          <div className='container-fluid'>
            <div className='navbar-header'>
              <a href='/' className='navbar-brand' data-no-route='true' onClick={ this.toggleCollapse.bind(this) }>
                <span className='glyphicon glyphicon-menu-hamburger'></span>
                <span className='sr-only'>reddit</span>
              </a>
              <a href='/' className='navbar-brand'>
                <span className='glyphicon logo-reddit'>reddit</span>
              </a>
            </div>
          </div>
        </div>
      </nav>
    );
  }
}

function NavBarFactory(app) {
  return app.mutate('core/components/navBar', NavBar);
}

export default NavBarFactory;
