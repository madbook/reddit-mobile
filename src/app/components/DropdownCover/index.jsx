import './styles.less';
import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

const T = React.PropTypes;

export function DropdownCover({ show }) {
  return show ? <div className='DropdownCover'/> : null;
}

DropdownCover.propTypes = {
  show: T.bool.isRequired,
};

const selector = createSelector(
  state => state.widgets.tooltip.id,
  tooltipId => ({ show: !!tooltipId }),
);

export default connect(selector)(DropdownCover);
