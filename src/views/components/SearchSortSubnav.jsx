import React from 'react';

import SortDropdown from '../components/SortDropdown';

function SearchSortSubnav (props) {
  return (
    <div className="TopSubnav search-">
      <span className="text-muted">Sorted by </span>

      <SortDropdown
        app={ props.app }
        sort={ props.sort || 'relevance' }
        sortParam={ 'sort' }
        list={ 'search' }
        baseUrl={ props.composeSortingUrl({ isSort: true }) }
        className='Dropdown-inline'
      />

      <span className="text-muted"> from </span>

      <SortDropdown
        app={ props.app }
        sort={ props.time || 'all' }
        sortParam={ 'time' }
        list={ 'time' }
        baseUrl={ props.composeSortingUrl({ isTime: true }) }
        className='Dropdown-inline'
      />
    </div>
  );
}

SearchSortSubnav.propTypes = {
  sort: React.PropTypes.string,
  composeSortingUrl: React.PropTypes.func,
  time: React.PropTypes.string,
};

export default SearchSortSubnav;
