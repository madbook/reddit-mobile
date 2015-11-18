import React from 'react';
import _ from 'lodash';
import debounce from 'lodash/function/debounce';
import BaseComponent from './BaseComponent';

class SearchBar extends BaseComponent {
  constructor(props) {
    super(props);
  }

  onSearch(e) {
    if (!this.props.onSearch) {
      return;
    }

    e.preventDefault();
    var val = this.refs.search.value.trim();

    if (val !== this.props.defaultValue) {
      this.props.onSearch(val);
    }
  }

  render() {
    return (
      <form action={ this.props.action } method='GET' ref='searchForm' onSubmit={ this.onSearch.bind(this) }>
        <div className='input-group vertical-spacing-top'>

          <input type='text' className='form-control' maxLength='512' name='q' ref='search'
             placeholder='Search...' defaultValue={ this.props.defaultValue } />

          <span className='input-group-btn'>
            <button className='btn btn-default' type='submit'>Search!</button>
          </span>
        </div>
      </form>
    );
  }
}

//TODO: someone more familiar with this component could eventually fill this out better
SearchBar.propTypes = {
  action: React.PropTypes.string.isRequired,
  defaultValue: React.PropTypes.string,
  onSearch: React.PropTypes.func,
};

export default SearchBar;
