import React from 'react';
import { models } from '@r/api-client';

import CommentReplyForm from './comment/CommentReplyForm';
import SortSelector from './SortSelector';
import extractErrorMsg from '../../lib/extractErrorMsg';
import { SORTS } from '../../sortValues';

const T = React.PropTypes;

export default class LinkTools extends React.Component {
  static propTypes = {
    user: T.object,
    app: T.object.isRequired,
    apiOptions: T.object.isRequired,
    linkId: T.string.isRequired,
    onNewComment: T.func,
    onSortChange: T.func,
    token: T.string,
    isLocked: T.bool,
    sort: T.string,
  };

  static defaultProps = {
    onNewComment: () => {},
    onSortChange: () => {},
    isLocked: false,
    sort: SORTS.CONFIDENCE,
    user: {},
  };

  constructor(props) {
    super(props);

    this.state = {
      showForm: false,
      commentValue: '',
      error: '',
      waitingForRequest: false,
    };

    this.toggleForm = this.toggleForm.bind(this);
    this.submitNewComment = this.submitNewComment.bind(this);
    this.handleFormChange = this.handleFormChange.bind(this);
  }

  toggleForm() {
    if (this.props.isLocked) { return; }
    if (this.props.app.needsToLogInUser()) { return; }

    this.setState({
      showForm: !this.state.showForm,
    });
  }

  handleFormChange(value) {
    this.setState({
      commentValue: value,
    });
  }

  async submitNewComment() {
    const { waitingForRequest } = this.state;
    const { app, apiOptions, linkId, onNewComment, user } = this.props;
    if (app.needsToLogInUser() || waitingForRequest) { return; }
    this.setState({ waitingForRequest: true });
    try {
      const options = {
        ...app.api.buildOptions(apiOptions),
        model: new models.Comment({
          thingId: linkId,
          text: this.state.commentValue.trim(),
        }),
      };

      const newComment = await app.api.comments.post(options);

      this.setState({
        showForm: false,
        commentValue: '',
        error: '',
        waitingForRequest: false,
      });

      app.emit('comment:new', {
        ...this.props,
        comment: newComment,
        user: { id: user.id },
      });

      onNewComment(newComment);
    } catch (e) {
      this.setState({
        waitingForRequest: false,
        error: extractErrorMsg(e),
      });
    }
  }

  render() {
    const { showForm } = this.state;

    return (
      <div className='LinkTools'>
        { showForm ? this.renderForm() : this.renderTools() }
      </div>
    );
  }

  renderForm() {
    const { commentValue, error, waitingForRequest } = this.state;

    return (
      <CommentReplyForm
        onClose={ this.toggleForm }
        onContentChange={ this.handleFormChange }
        onReplySubmit={ this.submitNewComment }
        buttonText='ADD COMMENT'
        value={ commentValue }
        error={ error }
        submitting={ waitingForRequest }
      />
    );
  }

  renderTools() {
    const { isLocked } = this.props;

    return (
      <div className='LinkTools__tools'>
        { this.renderSort() }
        <div
          className='LinkTools__comment'
          onClick={ this.toggleForm }
        >
          { isLocked ? 'Comments are locked' : 'Write a comment' }
        </div>
      </div>
    );
  }

  renderSort() {
    const { sort, app } = this.props;

    return (
      <div className='LinkTools__sort'>
        <SortSelector
          app={ app }
          sortValue={ sort }
          sortOptions={ [
            SORTS.CONFIDENCE,
            SORTS.TOP,
            SORTS.NEW,
            SORTS.CONTROVERSIAL,
            SORTS.QA,
          ] }
          onSortChange={ this.props.onSortChange }
          title='Sort comments by:'
        />
      </div>
    );
  }
}
