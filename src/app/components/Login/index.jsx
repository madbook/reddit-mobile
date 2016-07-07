import './styles.less';

import React from 'react';
import { METHODS } from '@r/platform/router';
import { Form } from '@r/platform/components';

import SnooIcon from 'app/components/SnooIcon';
import LoginInput from './Input';
import SquareButton from './SquareButton';

export default class Login extends React.Component {
  render() {
    return (
      <div className='Login'>
        <SnooIcon />
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
          />
          <LoginInput
              name='password'
              type='password'
              placeholder='Password'
              showTopBorder={ false }
          />
          <div className='Login__submit'>
            <SquareButton text='LOG IN' type='submit'/>
          </div>
        </Form>
    </div>
    );
  }
}
