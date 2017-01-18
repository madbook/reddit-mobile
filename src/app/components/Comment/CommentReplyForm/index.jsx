import './styles.less';

import React from 'react';
import { connect } from 'react-redux';

import { JSForm } from '@r/platform/components';

import cx from 'lib/classNames';
import * as replyActions from 'app/actions/reply';

const T = React.PropTypes;

export class CommentReplyForm extends React.Component {
  static propTypes = {
    onToggleReply: T.func.isRequired,
  };

  constructor (props) {
    super(props);

    this.state = {
      disableButton: true,
    };
  }

  onTextChange = (e) => {
    this.setState({ disableButton: !e.target.value.trim() });
  }

  render () {
    const { onToggleReply, onSubmitReply } = this.props;
    const { disableButton } = this.state;
    const buttonClass = cx('Button', { 'm-disabled': disableButton });

    return (
      <JSForm onSubmit={ onSubmitReply } className='CommentReplyForm'>
        <div className='CommentReplyForm__textarea'>
          <textarea className='TextField' name='text' onChange={ this.onTextChange } />
        </div>

        <div className='CommentReplyForm__footer'>
          <span
            className='CommentReplyForm__close icon icon-x Button m-linkbutton'
            onClick={ onToggleReply }
          />

          <div className='CommentReplyForm__button'>
            <button type='submit' className={ buttonClass } disabled={ disableButton }>
              ADD COMMENT
            </button>
          </div>
        </div>
      </JSForm>
    );
  }
}

const mapDispatchToProps = (dispatch, { parentId }) => ({
  onSubmitReply: formData => dispatch(replyActions.submit(parentId, formData)),
});

export default connect(null, mapDispatchToProps)(CommentReplyForm);
