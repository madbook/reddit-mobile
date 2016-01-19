import React from 'react';
import querystring from 'querystring';

import BasePage from './BasePage';
import SnooIconHeader from '../components/snooiconheader';

import MinimalInput from '../components/formElements/minimalinput';
import SquareButton from '../components/formElements/SquareButton';

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

const PasswordFieldTypes = {
  password: 'password',
  text: 'text',
};

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
    const { error, message } = props;

    this.state = {
      ...this.state,
      showForgot: false,
      passwordFieldType: PasswordFieldTypes.password,
      errorMessage: error ? message ||
                    ERROR_MESSAGES[error] ||
                    ERROR_MESSAGES.default : '',
      usernameText: '',
      passwordText: '',
    };

    this.goBack = this.goBack.bind(this);
    this.toggleShowForgot = this.toggleShowForgot.bind(this);
    this.updateUsername = this.updateField.bind(this, 'usernameText');
    this.updatePassword = this.updateField.bind(this, 'passwordText');
    this.clearPassword = this.clearPassword.bind(this);
    this.toggleType = this.toggleType.bind(this);
  }

  goBack() {
    this.props.app.redirect(this.props.originalUrl || '/');
  }

  updateField(name, e) {
    const newState = {
      [name]: e.target.value,
    };

    this.setState(newState);
  }

  clearPassword(e) {
    e.preventDefault();
    this.setState({passwordText: ''});
  }

  toggleShowForgot(e) {
    e.preventDefault();
    this.setState({showForgot: !this.state.showForgot});
  }

  toggleType(e) {
    e.preventDefault();
    this.setState({
      passwordFieldType: this.state.passwordFieldType === PasswordFieldTypes.password ?
        PasswordFieldTypes.text : PasswordFieldTypes.password,
    });
  }

  render () {
    const { error, originalUrl, ctx } = this.props;
    const { passwordFieldType, showForgot,
            errorMessage, passwordText, usernameText } = this.state;

    if (error) {
      // what to do with generic errors?
    }

    const passErr = error && error === '400';

    let linkDest = '';
    let refererTag;

    if (originalUrl) {
      linkDest = `/?${querystring.stringify({originalUrl})}`;

      refererTag = <input type='hidden' name='originalUrl' value={ originalUrl } />;
    }

    const blue = passwordFieldType === 'text' ? 'blue' : '';

    return (
      <div className='login-wrapper'>
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
              <form action='/login' method='POST' className='login-form'>
                <MinimalInput
                  name='username'
                  type='text'
                  placeholder='Username'
                  showTopBorder={ true }
                  onChange={ this.updateUsername }
                  value={ usernameText }
                />
                <MinimalInput
                  name='password'
                  type={ passwordFieldType }
                  placeholder='Password'
                  showTopBorder={ false }
                  error={ passErr ? errorMessage : '' }
                  onChange={ this.updatePassword }
                  value={ passwordText }
                >
                  {
                    passErr || passwordText.length === 0 ? (
                      <button
                        className={ `login__toggle-btn ${blue}` }
                        onClick={ this.toggleType }
                      >
                        <span className='icon-eye' />
                      </button>
                    ) : (
                      <button
                        className='login__clear-btn'
                        onClick={ this.clearPassword }
                      >
                        <span className='icon-x' />
                      </button>
                    )
                  }
                </MinimalInput>
                { refererTag }
                <input type='hidden' value={ ctx.csrf } name='_csrf' />
                <a
                  href='#'
                  className='pull-right login__forgot-link'
                  onClick={ this.toggleShowForgot }
                >
                  Forgot?
                </a>
                <div style={ {height: '45px', marginTop: '40px'} }>
                  <SquareButton text='Log In' />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default LoginPage;
