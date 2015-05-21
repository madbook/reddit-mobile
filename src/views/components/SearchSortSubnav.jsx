import React from 'react';

import SortDropdown from '../components/SortDropdown';

class SearchSortSubnav extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var props = this.props;
    return (
      <div className="TopSubnav search-">
        <span className="text-muted">Sorted by </span>

        <SortDropdown
          app={ props.app }
          random={ props.random }
          sort={ props.sort || 'relevance' }
          sortParam={ 'sort' }
          list={ 'search' }
          baseUrl={ props.composeSortingUrl({ isSort: true }) }
          className='Dropdown-inline'
        />

        <span className="text-muted"> from </span>

        <SortDropdown
          app={ props.app }
          random={ props.random }
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

export default SearchSortSubnav;
