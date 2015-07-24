import React from 'react';
import globals from '../../globals';
import querystring from 'querystring';

import BaseComponent from '../components/BaseComponent';

class LoginPage extends BaseComponent {
  constructor(props) {
    super(props);
  }

  render () {
    var errorClass = '';

    if (this.props.error) {
      errorClass = 'has-error';
    }

    var dest = this.props.query.originalUrl;
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

                <input type='hidden' value={ globals().csrf } name='_csrf' />

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

  static populateData (api, props, synchronous) {
    var defer = q.defer();
    defer.resolve();
    return defer.promise;
  }
};

export default LoginPage;
