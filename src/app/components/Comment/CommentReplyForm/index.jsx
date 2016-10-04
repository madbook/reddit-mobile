import './styles.less';
import React from 'react';

import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { METHODS } from '@r/platform/router';
import { Form } from '@r/platform/components';

const T = React.PropTypes;

export const closeButton = onToggleReply => {
  return (
    <span
      className='CommentReplyForm__close icon icon-x Button m-linkbutton'
      onClick={ onToggleReply }
    />
  );
};

export class CommentReplyForm extends React.Component {
  static propTypes = {
    text: T.string,
    onToggleReply: T.func,
  };

  static defaultProps = {
    onToggleReply: () => {},
  };

  constructor (props) {
    super(props);

    this.state = {
      disableButton: !props.text,
      text: props.text,
    };
  }

  onTextChange = (e) => {
    this.setState({
      text: e.target.value,
      disableButton: !e.target.value,
    });
  }

  render () {
    const { parentId, onToggleReply } = this.props;
    const { disableButton, text } = this.state;

    let buttonClass = 'Button';

    if (disableButton) {
      buttonClass += ' m-disabled';
    }

    return (
      <Form
        action={ '/comments' }
        method={ METHODS.POST }
        className='CommentReplyForm'
      >
        <input type='hidden' name='thingId' value={ parentId } />

        <div className='CommentReplyForm__textarea'>
          <textarea className='TextField' name='text' onChange={ this.onTextChange }>
            { text }
          </textarea>
        </div>

        <div className='CommentReplyForm__footer'>
          { closeButton(onToggleReply) }

          <div className='CommentReplyForm__button'>
            <button type='submit' className={ buttonClass } disabled={ disableButton }>
              ADD COMMENT
            </button>
          </div>
        </div>
      </Form>
    );
  }
}

const commentReplyFormSelector = createSelector(
  [
    (state, props) => props,
    (state, props) => ({ replying: state.replying[props.parentId] }),
  ], (props, replying) => ({ ... props, replying })
);

export default connect(commentReplyFormSelector)(CommentReplyForm);
