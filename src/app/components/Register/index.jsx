import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { METHODS } from 'platform/router';
import { BackAnchor, Anchor, Form } from 'platform/components';
import config from 'config';
import * as sessionActions from 'app/actions/session';

import goBackDest from 'lib/goBackDest';

import { themes } from 'app/constants';
import LoginInput from 'app/components/LoginRegistrationForm/Input';
import ReCaptcha from 'app/components/ReCaptcha';
import SnooIcon from 'app/components/SnooIcon';
import SquareButton from 'app/components/LoginRegistrationForm/SquareButton';
import 'app/components/LoginRegistrationForm/styles.less';

const CAPTCHA_ERRORS = {
  BAD_CAPTCHA: 'Please provide a valid captcha',
};

const EMAIL_ERRORS = {
  BAD_EMAIL: 'Sorry, the email you entered is invalid',
  NEWSLETTER_NO_EMAIL: 'Sorry, we need an email to send you the newsletter',
};

const PASS_ERRORS = {
  SHORT_PASSWORD: 'Sorry, the password you entered is too short',
};

const USER_ERRORS = {
  USERNAME_TAKEN: 'Sorry, that username is taken',
  USERNAME_INVALID_CHARACTERS: 'Sorry, your username contains invalid characters',
  USERNAME_TOO_SHORT: 'Sorry, your username must be between 3 and 20 characters',
  USERNAME_TAKEN_DEL: 'Sorry, the account associated with that username is deleted',
};

const DEFAULT_ERRORS = {
  'UNKNOWN_ERROR': 'Sorry, something went wrong. Please try again later',
};

const renderErrorMsg = (errorMsg) => {
  return (
    <p className='Register__error-text'>
      { errorMsg }
    </p>
  );
};

const TERMS = (
  <a
    href='/help/useragreement'
    className='text-link'
    target='_blank'
  >
    'Terms '
  </a>
);

const PRIVACY = (
  <a
    href='/help/privacypolicy'
    className='text-link'
    target='_blank'
  >
    'Privacy Policy '
  </a>
);

const CONTENT = (
  <a
    href='/help/contentpolicy/'
    className='text-link'
    target='_blank'
  >
    'Content Policy'
  </a>
);

const AGREEMENT = (
  <div className='Register__terms'>
    By signing up, you agree to our { TERMS }
    and that you have read our { PRIVACY }
    and { CONTENT }.
  </div>
);

class Register extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      isPasswordField: true,
      email: '',
      gRecaptchaResponse: '',
    };

    this.clearUsername = this.clearField.bind(this, 'username');
    this.clearPassword = this.clearField.bind(this, 'password');
    this.clearEmail = this.clearField.bind(this, 'email');
    this.updateUsername = this.updateField.bind(this, 'username');
    this.updatePassword = this.updateField.bind(this, 'password');
    this.updateEmail = this.updateField.bind(this, 'email');
    this.setRecaptchaResponse = this.setRecaptchaResponse.bind(this);
    this.toggleEye = this.toggleEye.bind(this);
  }

  toggleEye() {
    const { isPasswordField } = this.state;
    this.setState({ isPasswordField: !isPasswordField });
  }

  clearField(fieldName, e) {
    const { resetErrors } = this.props;
    e.preventDefault();
    this.setState({ [fieldName]: '' }, resetErrors);
  }

  updateField(fieldName, e) {
    e.preventDefault();
    this.setState({ [fieldName]: e.target.value });
  }

  setRecaptchaResponse(value) {
    this.setState({ gRecaptchaResponse: value });
  }

  renderEye() {
    const { isPasswordField } = this.state;
    const blue = isPasswordField ? '' : 'blue';

    return (
      <button
        type='button'
        className='Register__input-action-btn'
        onClick={ this.toggleEye }
      >
        <span className={ `icon icon-eye ${blue}` } />
      </button>
    );
  }

  renderClear(methodName) {
    return (
      <button
        type='button'
        className='Register__input-action-btn'
        onClick={ this[methodName] }
      >
        <span className='icon icon-x red' />
      </button>
    );
  }

  render() {
    const { error, theme, platform } = this.props;
    const { username, password, isPasswordField, email, gRecaptchaResponse } = this.state;
    const passwordFieldType = isPasswordField ? 'password' : 'text';
    const backDest = goBackDest(platform, ['/login', '/register']);
    const { recaptchaSitekey } = config;
    const captchaTheme = (theme === themes.DAYMODE) ? 'light' : 'dark';

    return (
      <div className='Register'>
        <div className='Register__header'>
          <BackAnchor
            className='Register__close icon icon-x'
            href={ backDest }
          />
        </div>
        <SnooIcon />
        <div className='Register__login-link'>
          <p>
            <Anchor href='/login' className='Register__login-link'>
              Already own an account? Log in!
            </Anchor>
          </p>
        </div>
        <Form
          className='Register__form'
          method={ METHODS.POST }
          action='/register'
        >
          <LoginInput
            name='username'
            type='text'
            placeholder='Choose a unique username'
            showTopBorder={ true }
            error={ error.username }
            onChange={ this.updateUsername }
            value={ username }
          >
            { error.username ? this.renderClear('clearUsername') : null }
          </LoginInput>
          <LoginInput
            name='password'
            type={ passwordFieldType }
            placeholder='Choose a unique password'
            showTopBorder={ false }
            shouldAutocomplete={ false }
            error={ error.password }
            onChange={ this.updatePassword }
            value={ password }
          >
            {
              error.password
                ? this.renderClear('clearPassword')
                : this.renderEye()
            }
          </LoginInput>
          <LoginInput
            name='email'
            type='email'
            placeholder='Your email'
            showTopBorder={ false }
            error={ error.email }
            onChange={ this.updateEmail }
            value={ email }
          >
            { error.email ? this.renderClear('clearEmail') : null }
          </LoginInput>
          <label className='Register__checkbox-label'>
            <input
              className='Register__checkbox'
              type='checkbox'
              name='newsletter'
              defaultChecked
            />
            Subscribe to newsletter
          </label>
          <ReCaptcha
            sitekey={ recaptchaSitekey }
            onSuccess={ this.setRecaptchaResponse }
            theme={ captchaTheme }
            reloadComparisonKey={ JSON.stringify(error) }
          />
          <input
            name='gRecaptchaResponse'
            type='hidden'
            value={ gRecaptchaResponse }
          />
          { error.captcha ? renderErrorMsg(error.captcha) : null }
          { error.default ? renderErrorMsg(error.default) : null }
          <div className='Register__submit'>
            <SquareButton text='REGISTER' type='submit'/>
          </div>
        </Form>
        { AGREEMENT }
      </div>
    );
  }
}

const checkErrors = session => {
  const error = {
    username: '',
    password: '',
    email: '',
    captcha: '',
    default: '',
  };
  const errorType = session ? session.error : null;

  if (errorType in EMAIL_ERRORS) {
    error.email = EMAIL_ERRORS[errorType];
  } else if (errorType in PASS_ERRORS) {
    error.password = PASS_ERRORS[errorType];
  } else if (errorType in USER_ERRORS) {
    error.username = USER_ERRORS[errorType];
  } else if (errorType in CAPTCHA_ERRORS) {
    error.captcha = CAPTCHA_ERRORS[errorType];
  } else if (errorType in DEFAULT_ERRORS) {
    error.default = DEFAULT_ERRORS[errorType];
  } else if (errorType) {
    // Not a token type error message. Set it to the string instead
    error.default = errorType;
  }

  return error;
};

const mapStateToProps = createSelector(
  state => state.theme,
  state => state.platform,
  state => state.session,
  (theme, platform, session) => ({
    theme,
    platform,
    error: checkErrors(session),
  })
);

const mapDispatchToProps = (dispatch) => ({
  resetErrors: () => {
    dispatch(sessionActions.sessionError(null));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Register);
