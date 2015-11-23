import React from 'react';
import querystring from 'querystring';

import BasePage from './BasePage';

class RegisterPage extends BasePage {
  render () {
    var usernameClass = '';
    var passwordClass = '';
    var emailClass = '';

    var errorClass = 'visually-hidden';

    var dest = this.props.ctx.query.originalUrl;
    var linkDest = '';
    var refererTag = '';
    var message;

    if (dest) {
      linkDest = '/?' + querystring.stringify({
        originalUrl: dest,
      });
      refererTag = <input type='hidden' name='originalUrl' value={dest} />;
    }

    if (this.props.ctx.query.error) {
      switch (this.props.ctx.query.error) {
        case 'EMAIL_NEWSLETTER':
          emailClass = 'has-error';
          message = 'Please enter an email if you wish to sign up to the newsletter.';
          break;
        case 'PASSWORD_MATCH':
          passwordClass = 'has-error';
          message = 'Passwords do not match.';
          break;
        case 'USERNAME_TAKEN':
          usernameClass = 'has-error';
          message = 'Your username has already been taken.'
          break;
        default:
          message = 'An error occured.';
          break;

      }

      errorClass = 'alert alert-danger alert-bar';
    }

    return (
      <main>
        <div className={ errorClass } role='alert'>
          { message }
        </div>

        <div className='container'>
          <div className='row'>
            <div className='col-xs-12 col-sm-6 LoginPage'>

              <h1 className='title h4'>Create a New Account</h1>

              <form action='/register' method='POST'>
                <div className={ usernameClass + ' form-group' }>
                  <label htmlFor='username' className='hidden'>Username</label>
                  <input id='username' className='form-control' name='username' type='text' placeholder='Choose a username' required='required' />
                </div>

                <div className={ passwordClass + ' form-group' }>
                  <label htmlFor='password' className='hidden'>Password</label>
                  <input id='password' className='form-control' name='password' type='password' placeholder='Password' required='required' />
                </div>

                <div className={ passwordClass + ' form-group' }>
                  <label htmlFor='password2' className='hidden'>Verify password</label>
                  <input id='password2' className='form-control' name='password2' type='password' placeholder='Verify password' required='required' />
                </div>

                <div className={ emailClass + ' form-group' }>
                  <label htmlFor='email' className='hidden'>Email (optional)</label>
                  <input id='email' className='form-control' name='email' type='email' placeholder='Email (optional)' />
                </div>

                <div className='checkbox'>
                  <label>
                    <input type='checkbox' name='newsletter' /> Subscribe to newsletter
                  </label>
                </div>

                { refererTag }

                <input type='hidden' value={ this.props.ctx.csrf } name='_csrf' />

                <button type='submit' className='btn-post btn-block'>Create Account</button>
              </form>

              <p>
                <a href={'/login' + linkDest } data-no-route='true'>Already have an account? Log in!</a>
              </p>
            </div>
          </div>

          <div className='text-muted text-small'>
            By signing up, you agree to our <a href='https://reddit.com/help/useragreement' className='text-link' target='_blank'>Terms </a>
            and that you have read our <a href='https://reddit.com/help/privacypolicy' className='text-link' target='_blank'>Privacy Policy </a>
            and <a href='https://www.reddit.com/help/contentpolicy/' className='text-link' target='_blank'>Content Policy</a>.
          </div>
        </div>
      </main>
    );
  }
};

export default RegisterPage;
