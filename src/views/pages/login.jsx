import React from 'react';
import querystring from 'querystring';

import BasePage from './BasePage';

class LoginPage extends BasePage {
  render () {
    var errorClass = '';

    if (this.props.ctx.query.error) {
      errorClass = 'has-error';
    }

    var dest = this.props.ctx.query.originalUrl;
    var linkDest = '';
    var refererTag = '';

    if (dest) {
      linkDest = '/?' + querystring.stringify({
        originalUrl: dest,
      });

      refererTag = <input type='hidden' name='originalUrl' value={dest} />;
    }

    return (
      <div>
        <div className='container'>
          <div className='row'>
            <div className='col-xs-12 col-sm-6 LoginPage'>
              <h1 className='title h4'>Log in</h1>

              <form action='/login' method='POST'>
                <div className='form-group LoginPage-zoom-holder'>
                  <label htmlFor='username' className='hidden'>Username</label>
                  <input id='username' className='form-control zoom-fix' name='username' type='text' placeholder='Username' />
                </div>

                <div className={ errorClass + ' form-group LoginPage-zoom-holder' }>
                  <label htmlFor='password' className='hidden'>Password</label>
                  <input id='password' className='form-control zoom-fix' name='password' type='password' placeholder='Password' />
                </div>

                { refererTag }

                <input type='hidden' value={ this.props.ctx.csrf } name='_csrf' />

                <button type='submit' className='btn-post btn-block'>Log In</button>
              </form>

              <p>
                <a href={'/register' + linkDest } data-no-route='true'>Don't have an account? Register!</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default LoginPage;
