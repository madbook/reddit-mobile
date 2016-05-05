import React from 'react';
import values from 'lodash/object/values';
import SnooIcon from '../icons/SnooIcon';
import constants from '../../../constants';

const T = React.PropTypes;

export default class Toaster extends React.Component {
  static propTypes = {
    message: T.string.isRequired,
    onClose: T.func.isRequired,
    iconType: T.oneOf(values(constants.TOASTER_TYPES)),
  };

  render() {
    const { message, iconType, onClose } = this.props;

    return (
      <div className='Toaster'>
        { iconType ? this.renderIcon() : null }
        <div className='Toaster__message'>{ message }</div>
        <div className='Toaster__close icon-x' onClick={ onClose }/>
      </div>
    );
  }

  renderIcon() {
    const { iconType } = this.props;

    switch (iconType) {
      case constants.TOASTER_TYPES.SUCCESS:
        return <div className='Toaster__iconCheck icon-check-circled white'/>;
      case constants.TOASTER_TYPES.FRIENDLY:
        return <div className='Toaster__iconSnoo'><SnooIcon /></div>;
      default:
        return <div className='Toaster__iconMoose'/>;
    }
  }
}
