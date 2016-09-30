import 'app/components/LoginRegistrationForm/styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { METHODS } from '@r/platform/router';
import { Form, Anchor } from '@r/platform/components';

import * as sessionActions from 'app/actions/session';

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

  render() {
    const { session } = this.props;
    const { isPasswordField, password, username } = this.state;
    const passwordFieldType = isPasswordField ? 'password' : 'text';
    const errorType = session ? session.error : null;

    const error = { username: '', password: '' };
    if (errorType) {
      error.password = 'Sorry, that’s not the right password';
    }

    return (
      <div className='Login'>
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
          </LoginInput >
          <div className='Login__submit'>
            <SquareButton text='LOG IN' type='submit'/>
          </div>
        </Form>
    </div>
    );
  }
}

const mapStateToProps = createSelector(
  state => state.session,
  session => ({ session }),
);

const mapDispatchToProps = (dispatch) => ({
  resetSessionError: () => {
    dispatch(sessionActions.sessionError(null));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
