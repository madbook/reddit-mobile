import React from 'react';

import constants from '../../constants';

import BaseComponent from './BaseComponent';
import ListingList from './ListingList';
import ListingPaginationButtons from './ListingPaginationButtons';

const Proptypes = React.PropTypes;

class ListingContainer extends BaseComponent {
  static propTypes = {
    compact: Proptypes.bool,
    shouldPage: Proptypes.bool,
    listingClassName: Proptypes.string,
    listings: Proptypes.array,
    ctx: Proptypes.object,
    pagingPrefix: Proptypes.string,
    prevUrl: Proptypes.string,
    nextUrl: Proptypes.string,
  };

  static defaultProps = {
    shouldPage: true,
  };

  constructor(props) {
    super(props);

    this.state = {
      compact: this.props.compact,
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
    const {
      listings,
      ctx,
      shouldPage,
      pagingPrefix,
      prevUrl,
      nextUrl,
      listingClassName,
    } = this.props;

    const compact = this.state.compact;

    let pagination;

    // Default paging to `true`
    if (shouldPage && listings.length) {
      pagination = (
        <ListingPaginationButtons
          pagingPrefix={ pagingPrefix }
          listings={ listings }
          compact={ compact }
          ctx={ ctx }
          prevUrl={ prevUrl }
          nextUrl={ nextUrl }
        />
      );
    }

    return (
      <div className={ 'container Listing-container' + (compact ? ' compact' : '') }>
        <ListingList
          { ...this.props }
          compact={ compact }
          className = { listingClassName }
        />
        { pagination }
      </div>
    );
  }
}

export default ListingContainer;
