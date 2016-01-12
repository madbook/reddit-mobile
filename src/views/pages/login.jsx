import React from 'react';
import querystring from 'querystring';

import BasePage from './BasePage';
import SnooIconHeader from '../components/snooiconheader';

const ERROR_MESSAGES = {
  504: 'The request timed out',
  500: 'There was a problem with the server',
  400: 'Wrong password',
  default: 'An error occured.',
};

const EMAIL_ERRORS = [
  'BAD_EMAIL',
];

const PASS_ERRORS = [
  'PASSWORD_MATCH',
  'WRONG_PASSWORD',
  'SHORT_PASSWORD',
  'BAD_PASSWORD',
  'BAD_PASSWORD_MATCH',
];

const USER_ERRORS = [
  'USER_DOESNT_EXIST',
  'USERNAME_TAKEN',
  'USERNAME_INVALID_CHARACTERS',
  'USERNAME_TOO_SHORT',
  'USERNAME_TAKEN_DEL',
];

const ERROR_TYPES = [
  ...EMAIL_ERRORS,
  ...USER_ERRORS,
  ...PASS_ERRORS,
];

class LoginPage extends BasePage {
  static propTypes = {
    error: React.PropTypes.string,
    message: React.PropTypes.string,
    originalUrl: React.PropTypes.string,
  };

  static defaultProps = {
    username: '',
  };

  constructor(props) {
    super(props);

    this.goBack = this.goBack.bind(this);
  }

  goBack() {
    this.props.app.redirect('/');
  }

  render () {
    const {
      error,
      message,
      originalUrl,
      ctx,
      username,
    } = this.props;

    let errorClass = 'visually-hidden';
    let passwordClass = '';

    const errorMessage = message ||
                        ERROR_MESSAGES[error] ||
                        ERROR_MESSAGES.default;

    if (error) {
      errorClass = 'alert alert-danger alert-bar';

      if (error === '400') {
        passwordClass = 'has-error';
      }
    }

    let linkDest = '';
    let refererTag;

    if (originalUrl) {
      linkDest = `/?${querystring.stringify({originalUrl})}`;

      refererTag = <input type='hidden' name='originalUrl' value={ originalUrl } />;
    }



    return (
      <div className='login-wrapper'>
        <div className={ errorClass } role='alert'>
          { errorMessage }
        </div>
        <SnooIconHeader title='Log in' close={ this.goBack } />
        <div className='container'>
          <div className='row'>
            <div className='col-xs-12 col-sm-6 LoginPage'>
              <p className='login-register-link'>
                <a
                  href={ '/register' + linkDest }
                  data-no-route='true'
                >New user? Sign up!</a>
              </p>
              <form action='/login' method='POST'>
                <div className='form-group'>
                  <label htmlFor='username' className='hidden'>Username</label>
                  <input
                    id='username'
                    className='form-control'
                    name='username'
                    type='text'
                    placeholder='Username'
                    defaultValue={ username }
                  />
                </div>

                <div className={ `${passwordClass} form-group` }>
                  <label htmlFor='password' className='hidden'>Password</label>
                  <input
                    id='password'
                    className='form-control'
                    name='password'
                    type='password'
                    placeholder='Password'
                  />
                </div>

                { refererTag }

                <input type='hidden' value={ ctx.csrf } name='_csrf' />

                <button type='submit' className='btn-post btn-block'>Log In</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default LoginPage;
