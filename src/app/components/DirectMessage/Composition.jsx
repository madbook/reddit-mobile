import './Composition.less';
import React from 'react';
import { METHODS } from '@r/platform/router';
import { Form } from '@r/platform/components';

const T = React.PropTypes;

export default function DirectMessageComposition(props) {
  return (
    <Form
      method={ METHODS.POST }
      action='/message/compose'
      className='DirectMessageComposition'
    >
      <input
        className='DirectMessageComposition__input'
        name='to'
        placeholder='Who do you want to message?'
        defaultValue={ props.recipient }
      />
      <input
        className='DirectMessageComposition__input'
        type='disabled'
        value={ `From: ${ props.username }` }
      />
      <input
        className='DirectMessageComposition__input'
        name='subject'
        placeholder='Add an interesting title'
      />
      <input
        className='DirectMessageComposition__input'
        name='body'
        placeholder='Add a dank meme reference'
      />
      <button
        className='DirectMessageComposition__submit'
        type='submit'
      >
        Send Message
      </button>
    </Form>
  );
}

DirectMessageComposition.propTypes = {
  username: T.string.isRequired,
  recipient: T.string,
};

DirectMessageComposition.defaultProps = {
  recipient: '',
};
