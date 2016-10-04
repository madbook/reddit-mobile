import './styles.less';
import React from 'react';

import cx from 'lib/classNames';
const T = React.PropTypes;

export default class EditForm extends React.Component {
  static propTypes = {
    startingText: T.string.isRequired,
    editPending: T.bool.isRequired,
    onCancelEdit: T.func.isRequired,
    onSaveEdit: T.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      editedText: props.startingText,
    };
  }

  saveEdit = () => {
    if (this.props.editPending) { return; } // don't update if we're already pending

    const newText = this.state.editedText.trim();
    if (newText !== this.props.startingText) {
      this.props.onSaveEdit(newText);
    }
  }

  onTextAreaChange = e => {
    this.setState({ editedText: e.target.value });
  }

  render() {
    const { editPending } = this.props;
    const { editedText } = this.state;

    return (
      <div className='EditForm'>
        <div className='EditForm__textarea-holder'>
          <textarea
            className='EditForm__textarea'
            value={ editedText }
            disabled={ editPending }
            onChange={ this.onTextAreaChange }
          />
        </div>
        { this.renderEditControls() }
      </div>
    );
  }

  renderEditControls() {
    const { editPending, onCancelEdit } = this.props;

    return (
      <div className='EditForm__edit-controls'>
        <div className='EditForm__edit-cancel' onClick={ onCancelEdit }>
          Cancel
        </div>
        <div
          className={ cx('EditForm__edit-button', {
            disabled: editPending,
          }) }
          onClick={ this.saveEdit }
        >
          { `Updat${editPending ? 'ing' : 'e'}` }
        </div>
      </div>
    );
  }
}
