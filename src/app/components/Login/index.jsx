import React from 'react';
import { METHODS } from '@r/platform/router';
import { Form } from '@r/platform/components';

export default class Login extends React.Component {
  render() {
    return (
      <Form className='Login' method={ METHODS.POST } action='/login'>
        <input name='username' placeholder='username'/>
        <input name='password' placeholder='password' type='password'/>
        <button type='submit'>Submit</button>
      </Form>
    );
  }
}
