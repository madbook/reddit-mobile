import React from 'react';

import BaseComponent from '../BaseComponent';
import DropdownRow from '../dropdown/DropdownRow';
import SquareButton from '../formElements/SquareButton';

const T = React.PropTypes;

export default class DropdownDeleteRow extends BaseComponent {
  static propTypes = {
    onDeleteClicked: T.func.isRequired,
    thingName: T.string.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      showingConfirmation: false,
    };

    this.toggleDeleteConfirmation = this.toggleDeleteConfirmation.bind(this);
    this.onDeleteConfirmed = this.onDeleteConfirmed.bind(this);
  }

  toggleDeleteConfirmation() {
    this.setState({ showingConfirmation: !this.state.showingConfirmation });
  }

  onDeleteConfirmed() {
    this.props.onDeleteClicked();
  }

  render() {
    const { showingConfirmation } = this.state;

    return (
      <DropdownRow onClick={ this.toggleDeleteConfirmation }>
        <div className='DropdownRow__icon icon-delete_remove' />
        { showingConfirmation
        ? this.renderConfirmationPrompt()
        : this.renderDeleteText() }
      </DropdownRow>
    );
  }

  renderDeleteText() {
    return (
      <div className='DropdownRow__text' onClick={ this.toggleDeleteConfirmation }>
        { `Delete ${this.props.thingName}` }
      </div>
    );
  }

  renderConfirmationPrompt() {
    return (
      <div className='DropdownRow__deletePrompt'>
        <div className='DropdownRow__promptButton'>
          <SquareButton
            text='Cancel'
            onClick={ this.toggleDeleteConfirmation }
          />
        </div>
        <div className='DropdownRow__promptButton'>
          <SquareButton
            text='Delete'
            modifier='m-danger'
            onClick={ this.onDeleteConfirmed }
          />
        </div>
      </div>
    );
  }
}
