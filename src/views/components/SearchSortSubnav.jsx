import React from 'react';

import SortSelector from './SortSelector';
import { SORTS } from '../../sortValues';

function SearchSortSubnav(props) {
  const sortUrl = props.composeSortingUrl({ isSort: true });
  const timeUrl = props.composeSortingUrl({ isTime: true });

  // define callbacks
  const handleSortChange = function(newSort) {
    props.app.redirect(`${sortUrl}&sort=${newSort}`);
  };

  const handleTimeChange = function(newSort) {
    props.app.redirect(`${timeUrl}&time=${newSort}`);
  };

  return (
    <div className='TopSubnav search-'>
      <div className='TopSubnav__sortDropdown'>
        <SortSelector
          app={ props.app }
          sortValue={ props.sort || SORTS.RELEVANCE }
          sortOptions={ [
            SORTS.RELEVANCE,
            SORTS.HOT,
            SORTS.NEW,
            SORTS.TOP,
            SORTS.COMMENTS,
          ] }
          onSortChange={ handleSortChange }
          title='Sort posts by:'
        />
      </div>

      <div className='TopSubnav__sortDropdown'>
        <SortSelector
          app={ props.app }
          sortValue={ props.time || SORTS.ALL_TIME }
          sortOptions={ [
            SORTS.ALL_TIME,
            SORTS.PAST_YEAR,
            SORTS.PAST_MONTH,
            SORTS.PAST_WEEK,
            SORTS.PAST_DAY,
            SORTS.PAST_HOUR,
          ] }
          onSortChange={ handleTimeChange }
          title='Sort posts by:'
        />
      </div>
    </div>
  );
}

SearchSortSubnav.propTypes = {
  sort: React.PropTypes.string,
  composeSortingUrl: React.PropTypes.func,
  time: React.PropTypes.string,
};

export default SearchSortSubnav;
