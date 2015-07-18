import React from 'react';

import SortDropdown from '../components/SortDropdown';
import BaseComponent from './BaseComponent';

class SearchSortSubnav extends BaseComponent {
  constructor(props) {
    super(props);
  }

  render() {
    var props = this.props;
    return (
      <div className="TopSubnav search-">
        <span className="text-muted">Sorted by </span>

        <SortDropdown
          sort={ props.sort || 'relevance' }
          sortParam={ 'sort' }
          list={ 'search' }
          baseUrl={ props.composeSortingUrl({ isSort: true }) }
          className='Dropdown-inline'
        />

        <span className="text-muted"> from </span>

        <SortDropdown
          sort={ props.time || 'all' }
          sortParam={ 'time' }
          list={ 'time' }
          baseUrl={ props.composeSortingUrl({ isTime: true }) }
          className='Dropdown-inline'
        />
      </div>
    );
  }
}

//TODO: someone more familiar with this component could eventually fill this out better
SearchSortSubnav.propTypes = {
  sort: React.PropTypes.string,
  composeSortingUrl: React.PropTypes.func,
  time: React.PropTypes.string,
};

export default SearchSortSubnav;
