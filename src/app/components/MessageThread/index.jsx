import './styles.less';
import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { BackAnchor, JSForm } from '@r/platform/components';

import * as mailActions from 'app/actions/mail';
import ThreadMessage from './Message';

const T = React.PropTypes;

export class MessageThread extends React.Component {
  static propTypes = {
    messages: T.object.isRequired,
    threadId: T.string.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      showForm: false,
      formBody: '',
    };
  }

  onFormSubmitAction = data => {
    this.props.onFormSubmit(data);
    this.setState({ showForm: false, formBody: '' });
  };

  onToggleShowForm = () => {
    this.setState({ showForm: !this.state.showForm });
  };

  onEditReply = e => {
    e.preventDefault();
    this.setState({ formBody: e.target.value });
  };

  render() {
    const {
      messages,
      threadId,
    } = this.props;
    const { showForm } = this.state;

    const headMessageId = `t4_${threadId}`;
    const headMessage = messages[headMessageId];

    return (
      <div className='MessageThread'>
        <div className='MessageThread__header'>
          <BackAnchor
            className='MessageThread__backlink icon icon-x'
            href="/message/messages/"
          />
          <div className='MessageThread__subject'>
            { headMessage.subject }
          </div>
        </div>
        <div className='MessageThread__divider' />
        <div className='MessageThread__content'>
          { this.renderMessage(headMessage) }
          { headMessage.replies.map(reply => this.renderMessage(messages[reply])) }
        </div>
        { this.renderReplyToggle() }
        { showForm ? this.renderForm(headMessageId) : null }
      </div>
    );
  }

  renderMessage(message) {
    return (
      <div className='MessageThread__item'>
        <ThreadMessage message={ message } />
      </div>
    );
  }

  renderReplyToggle() {
    const { showForm } = this.state;

    if (showForm) {
      return (
        <div className='MessageThread__reply' onClick={ this.onToggleShowForm }>
          <span className='MessageThread__cancelReplyIcon icon icon-x' />
        </div>
      );
    }

    return (
      <div className='MessageThread__reply' onClick={ this.onToggleShowForm }>
        <span className='MessageThread__replyIcon icon icon-reply2' />
        Reply
      </div>
    );
  }

  renderForm(headMessageId) {
    const { formBody } = this.state;

    return (
      <JSForm
        className='MessageThread__form'
        onSubmit={ this.onFormSubmitAction }
      >
        <textarea
          className='MessageThread__formBody'
          name='body'
          placeholder='Memes go here'
          value={ formBody }
          rows='5'
          onChange={ this.onEditReply }
        />
        <input
          name='thingId'
          type='hidden'
          readOnly
          value={ headMessageId }
        />
        <button
          className='MessageThread__formSubmit'
          type='submit'
        >
          SEND MESSAGE
        </button>
      </JSForm>
    );
  }
}

const selector = createSelector(
  state => state.messages,
  messages => ({
    messages,
  })
);

const mapDispatchToProps = dispatch => ({
  onFormSubmit: data => dispatch(mailActions.postMessage(data)),
});

const mergeProps = (stateProps, dispatchProps, ownProps) => ({
  ...stateProps,
  ...dispatchProps,
  threadId: ownProps.urlParams.threadId,
});

export default connect(selector, mapDispatchToProps, mergeProps)(MessageThread);
