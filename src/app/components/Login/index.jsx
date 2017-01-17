/* eslint dot-notation: 0 */
import 'app/components/LoginRegistrationForm/styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { redirect } from '@r/platform/actions';
import { METHODS } from '@r/platform/router';
import { Form, Anchor, BackAnchor } from '@r/platform/components';

import { loginErrors, genericErrors } from 'app/constants';

import * as sessionActions from 'app/actions/session';
import * as xpromoActions from 'app/actions/xpromo';

import goBackDest from 'lib/goBackDest';
import { markBannerClosed } from 'lib/smartBannerState';

import SnooIcon from 'app/components/SnooIcon';
import LoginInput from 'app/components/LoginRegistrationForm/Input';
import SquareButton from 'app/components/LoginRegistrationForm/SquareButton';


class Login extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      isPasswordField: true,
      password: '',
      username: '',
    };

    this.clearPassword = this.clearField.bind(this, 'password');
    this.clearUsername = this.clearField.bind(this, 'username');
    this.updatePassword = this.updateField.bind(this, 'password');
    this.updateUsername = this.updateField.bind(this, 'username');
    this.toggleEye = this.toggleEye.bind(this);
  }

  toggleEye() {
    const { isPasswordField } = this.state;
    this.setState({ isPasswordField: !isPasswordField });
  }

  clearField(fieldName, e) {
    const { resetSessionError } = this.props;
    e.preventDefault();
    this.setState({ [fieldName]: '' }, resetSessionError);
  }

  updateField(fieldName, e) {
    e.preventDefault();
    this.setState({ [fieldName]: e.target.value });
  }

  renderClear(methodName) {
    return (
      <button
        type='button'
        className='Login__input-action-btn'
        onClick={ this[methodName] }
      >
        <span className='icon icon-x red' />
      </button>
    );
  }

  renderEye() {
    const { isPasswordField } = this.state;
    const blue = isPasswordField ? '' : 'blue';

    return (
      <button
        type='button'
        className='Login__input-action-btn'
        onClick={ this.toggleEye }
      >
        <span className={ `icon icon-eye ${blue}` } />
      </button>
    );
  }

  onAppPromoClick = () => {
    const { nativeAppNavigator, nativeAppLink } = this.props;
    markBannerClosed();
    nativeAppNavigator(nativeAppLink);
  }

  renderAppPromo() {
    return (
      <div className='Login__app-promo'>
        <p className='Login__app-promo__or'>or</p>
        <SquareButton
            onClick={ this.onAppPromoClick }
            modifier='orangered'
            text='Continue in the app'/>
        <p className='Login__app-promo__subtext'>(no login required)</p>
      </div>
    );
  }

  render() {
    const { session, platform, displayAppPromo } = this.props;
    const { isPasswordField, password, username } = this.state;
    const passwordFieldType = isPasswordField ? 'password' : 'text';
    const backDest = goBackDest(platform, ['/login', '/register']);
    const errorType = session ? session.error : null;

    const error = { username: '', password: '' };

    switch (errorType) {
      case loginErrors.WRONG_PASSWORD: {
        error.password = 'Sorry, that’s not the right password';
        break;
      }

      case loginErrors.BAD_USERNAME: {
        error.username = 'Sorry, that’s not a valid username';
        break;
      }

      case loginErrors.INCORRECT_USERNAME_PASSWORD: {
        error.username = true;
        error.password = 'Sorry, that’s an incorrect username or password';
        break;
      }

      case genericErrors.UNKNOWN_ERROR: {
        error.password = 'Sorry, we were unable to log you in';
        break;
      }
    }

    return (
      <div className='Login'>
        <div className='Register__header'>
          <BackAnchor
            className='Register__close icon icon-x'
            href={ backDest }
          />
        </div>
        <SnooIcon />
        <div className='Login__register-link'>
          <p>
            <Anchor href='/register'> New user? Sign up! </Anchor>
          </p>
        </div>
        <Form
          className='Login__form'
          method={ METHODS.POST }
          action='/login'
        >
          <LoginInput
            name='username'
            type='text'
            placeholder='Username'
            showTopBorder={ true }
            error={ error.username }
            onChange={ this.updateUsername }
            value={ username }
          >
            {
              error.username
              ? this.renderClear('clearUsername')
              : null
            }
          </LoginInput>
          <LoginInput
            name='password'
            type={ passwordFieldType }
            placeholder='Password'
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
              name='redirectTo'
              type='hidden'
              value={ backDest } />
          <div className='Login__submit'>
            <SquareButton text='LOG IN' type='submit'/>
          </div>
        </Form>
        { displayAppPromo ? this.renderAppPromo() : null }
    </div>
    );
  }
}

const mapStateToProps = createSelector(
  state => state.session,
  state => state.platform,
  (session, platform) => {
    const displayAppPromo = !!platform.currentPage.queryParams['native_app_promo'];
    const nativeAppLink = platform.currentPage.queryParams['native_app_link'];
    return { session, platform, nativeAppLink, displayAppPromo };
  },
);

const mapDispatchToProps = (dispatch) => ({
  resetSessionError: () => {
    dispatch(sessionActions.sessionError(null));
  },
  nativeAppNavigator: (url) => {
    dispatch(xpromoActions.promoClicked());
    dispatch(redirect(url));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
