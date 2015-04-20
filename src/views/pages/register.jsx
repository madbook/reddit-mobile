import React from 'react';

class RegisterPage extends React.Component {
  constructor(props) {
    super(props);
  }

  render () {
    var usernameClass = '';
    var passwordClass = '';
    var emailClass = '';

    var errorClass = 'visually-hidden';

    if (this.props.error) {
      switch (this.props.error) {
        case 'EMAIL_NEWSLETTER':
          emailClass = 'has-error';
          break;
        case 'PASSWORD_MATCH':
          emailClass = 'has-error';
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
          { this.props.message }
        </div>

        <div className='container'>
          <div className='row'>
            <div className='col-xs-12 col-sm-6'>

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
                    <input type='checkbox' name='newsletter' defaultChecked='checked' /> Subscribe to newsletter
                  </label>
                </div>

                <input type='hidden' value={ this.props.csrf } name='_csrf' />

                <button type='submit' className='btn-post btn-block'>Create Account</button>
              </form>

              <p>
                <a href='/login' data-no-route='true'>Already have an account? Log in!</a>
              </p>
            </div>
          </div>

          <div className='text-muted text-small'>
            We care about your privacy, and we never spam. By creating an
            account, you agree to reddit's
            <a href='http://reddit.com/help/useragreement' className='text-link'> User Agreement </a>
            and
            <a href='http://reddit.com/help/privacypolicy' className='text-link'> Privacy Policy</a>.
            We're proud of them, and you should read them.
          </div>
        </div>
      </main>
    );
  }

  static populateData (api, props, synchronous) {
    var defer = q.defer();
    defer.resolve();
    return defer.promise;
  }
};

function RegisterPageFactory(app) {
  return app.mutate('core/pages/register', RegisterPage);
}

export default RegisterPageFactory;
