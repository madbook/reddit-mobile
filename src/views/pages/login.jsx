import React from 'react';
import querystring from 'querystring';

import BasePage from './BasePage';

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

  componentDidMount() {
    const { error, app, ctx, username } = this.props;
    const notifications = ctx.notifications || [];
    const loginAttempt = notifications.includes('login');

    if (loginAttempt && error) {
      const err = (error === '400') ? 'WRONG_PASSWORD' : error;
      const eventProps = {
        ...this.props,
        user: {
          name: username,
        },
        country: app.getState('country'),
        successful: false,
        process_notes: ERROR_TYPES.includes(err) ? err : null,
      };

      app.emit('login:attempt', eventProps);
    }
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
      <div>
        <div className={ errorClass } role='alert'>
          { errorMessage }
        </div>
        <div className='container'>
          <div className='row'>
            <div className='col-xs-12 col-sm-6 LoginPage'>
              <h1 className='title h4'>Log in</h1>

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

              <p>
                <a
                  href={ `/register${linkDest}` }
                  data-no-route='true'
                >Don't have an account? Register!</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default LoginPage;
