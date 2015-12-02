import React from 'react';
import constants from '../../constants';
import propTypes from '../../propTypes';

import BaseComponent from './BaseComponent';
import ListingList from './ListingList';

const Proptypes = React.PropTypes;

class ListingContainer extends BaseComponent {
  constructor(props) {
    super(props);

    this.state = {
      compact: this.props.compact
    };

    this._onCompactToggle = this._onCompactToggle.bind(this);
  }

  componentDidMount() {
    this.props.app.on(constants.COMPACT_TOGGLE, this._onCompactToggle);
  }

  componentWillUnmount() {
    this.props.app.off(constants.COMPACT_TOGGLE, this._onCompactToggle);
  }

  _onCompactToggle(compact) {
    this.setState({ compact });
  }

  render() {
    const props = this.props;
    const compact = this.state.compact;

    return (
      <div className={'container Listing-container' + (compact ? ' compact' : '')}>
        <ListingList
          { ...props }
          compact={ compact }
          className = { props.listingClassName }
        />
        { this.props.children }
      </div>
    );
  }

  static propTypes = {
    compact: Proptypes.bool,
    listingClassName: Proptypes.string,
  }
}

export default ListingContainer