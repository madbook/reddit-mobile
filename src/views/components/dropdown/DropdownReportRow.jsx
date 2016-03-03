import React from 'react';

import BaseComponent from '../BaseComponent';
import DropdownRow from '../dropdown/DropdownRow';
import SquareButton from '../formElements/SquareButton';

const T = React.PropTypes;

function focusInputRef(inputRef) {
  if (inputRef) {
    inputRef.focus();
  }
}

export default class DropdownReportRow extends BaseComponent {
  static propTypes = {
    onReportClicked: T.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      showingReportForm: false,
      reportReason: '',
      reportButtonEnabled: false,
    };

    this.toggleReportFormVisible = this.toggleReportFormVisible.bind(this);
    this.onReportSubmitClicked = this.onReportSubmitClicked.bind(this);
    this.onReportFormClicked = this.onReportFormClicked.bind(this);
    this.onReportReasonInputChange = this.onReportReasonInputChange.bind(this);
  }

  toggleReportFormVisible() {
    this.setState({ showingReportForm: !this.state.showingReportForm });
  }

  onReportSubmitClicked() {
    this.props.onReportClicked(this.state.reportReason.trim());
  }

  onReportFormClicked(e) {
    e.stopPropagation();
  }

  onReportReasonInputChange(e) {
    const value = e.target.value;

    this.setState({
      reportReason: value,
      reportButtonEnabled: !!value.trim(),
    });
  }

  render() {
    const { showingReportForm } = this.state;
    const icon = showingReportForm ? 'icon-x' : 'icon-flag';
    const iconCls = `DropdownRow__icon ${icon}`;

    return (
      <DropdownRow onClick={ this.toggleReportFormVisible }>
        <div className={ iconCls }/>
        { showingReportForm ? this.renderReportForm() : this.renderReportText() }
      </DropdownRow>
    );
  }

  renderReportText() {
    return (
      <div className='DropdownRow__text' >
        Report
      </div>
    );
  }

  renderReportForm() {
    const { reportReason, reportButtonEnabled } = this.state;

    return (
      <div
        className='DropdownRow__reportForm'
        onClick={ this.handleReportClicked }
      >
        <input
          className='DropdownRow__reportInput'
          value={ reportReason }
          onChange={ this.onReportReasonInputChange }
          ref={ focusInputRef }
          placeholder='Reason for reporting'
        />
        <div className='DropdownRow__reportButton'>
          <SquareButton
            text='Report'
            enabled={ reportButtonEnabled }
            onClick={ this.onReportSubmitClicked }
          />
        </div>
      </div>
    );
  }
}
