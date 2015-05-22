import React from 'react';

class LoginPage extends React.Component {
  constructor(props) {
    super(props);
  }

  render () {
    var errorClass = '';

    if (this.props.error) {
      errorClass = 'has-error';
    }

    return (
      <div>
        <div className='container'>
          <div className='row'>
            <div className='col-xs-12 col-sm-6'>
              <h1 className='title h4'>Log in</h1>

              <form action='/login' method='POST'>
                <div className='form-group'>
                  <label htmlFor='username' className='hidden'>Username</label>
                  <input id='username' className='form-control' name='username' type='text' placeholder='Username' />
                </div>

                <div className={ errorClass + ' form-group' }>
                  <label htmlFor='password' className='hidden'>Password</label>
                  <input id='password' className='form-control' name='password' type='password' placeholder='Password' />
                </div>

                <input type='hidden' value={ this.props.csrf } name='_csrf' />

                <button type='submit' className='btn-post btn-block'>Log In</button>
              </form>

              <p>
                <a href='/register' data-no-route='true'>Don't have an account? Register!</a>
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
