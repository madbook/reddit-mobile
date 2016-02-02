import React from 'react';
import querystring from 'querystring';

import BasePage from './BasePage';

const ERROR_MESSAGES = {
  EMAIL_NEWSLETTER: 'please enter an email to sign up for the newsletter',
  PASSWORD_MATCH: 'passwords do not match',
  500: 'There was a problem with the server',
  default: 'An error occured.',
};

const terms = (
  <a href='/help/useragreement' className='text-link' target='_blank'>Terms</a>
);
const privacy = (
  <a href='/help/privacypolicy' className='text-link' target='_blank'>Privacy Policy </a>
);
const content = (
  <a href='/help/contentpolicy/' className='text-link' target='_blank'>Content Policy</a>
);

class RegisterPage extends BasePage {
  static propTypes = {
    originalUrl: React.PropTypes.string,
    error: React.PropTypes.string,
    message: React.PropTypes.string,
  };

  render () {
    let usernameClass = '';
    let passwordClass = '';
    let emailClass = '';

    let errorClass = 'visually-hidden';

    const props = this.props;
    const { originalUrl, error, ctx } = this.props;

    const message = props.message ||
                    ERROR_MESSAGES[error] ||
                    ERROR_MESSAGES.default;
    let linkDest = '';
    let refererTag = '';

    if (originalUrl) {
      linkDest = `/?${querystring.stringify({originalUrl})}`;
      refererTag = <input type='hidden' name='originalUrl' value={ originalUrl } />;
    }

    if (error) {
      switch (error) {
        case 'EMAIL_NEWSLETTER':
          emailClass = 'has-error';
          break;
        case 'PASSWORD_MATCH':
          passwordClass = 'has-error';
          break;
        case 'USERNAME_TAKEN':
          usernameClass = 'has-error';
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
                <div className={ `${usernameClass} form-group` }>
                  <label htmlFor='username' className='hidden'>Username</label>
                  <input
                    id='username'
                    className='form-control'
                    name='username'
                    type='text'
                    placeholder='Choose a username'
                    required='required'
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
                    required='required'
                  />
                </div>

                <div className={ `${passwordClass} form-group` }>
                  <label htmlFor='password2' className='hidden'>Verify password</label>
                  <input
                    id='password2'
                    className='form-control'
                    name='password2'
                    type='password'
                    placeholder='Verify password'
                    required='required'
                  />
                </div>

                <div className={ `${emailClass} form-group` }>
                  <label htmlFor='email' className='hidden'>Email (optional)</label>
                  <input
                    id='email'
                    className='form-control'
                    name='email'
                    type='email'
                    placeholder='Email (optional)'
                  />
                </div>

                <div className='checkbox'>
                  <label>
                    <input type='checkbox' name='newsletter' /> Subscribe to newsletter
                  </label>
                </div>

                { refererTag }

                <input type='hidden' value={ ctx.csrf } name='_csrf' />

                <button type='submit' className='btn-post btn-block'>Create Account</button>
              </form>

              <p>
                <a
                  href={ `/login${linkDest}` }
                  data-no-route='true'
                >Already have an account? Log in!</a>
              </p>
            </div>
          </div>

          <div className='text-muted text-small'>
            By signing up, you agree to our { terms }
            and that you have read our { privacy }
            and { content }.
          </div>
        </div>
      </main>
    );
  }
}

export default RegisterPage;
