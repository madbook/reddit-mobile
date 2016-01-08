import React from 'react';
import BaseComponent from './BaseComponent';

class SearchBar extends BaseComponent {
  //TODO: someone more familiar with this component could eventually fill this out better
  static propTypes = {
    action: React.PropTypes.string.isRequired,
    defaultValue: React.PropTypes.string,
    onSearch: React.PropTypes.func,
  };
  
  constructor(props) {
    super(props);

    this.onSearch = this.onSearch.bind(this);
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
      <form
        action={ this.props.action }
        method='GET'
        ref='searchForm'
        onSubmit={ this.onSearch }
      >
        <div className='input-group vertical-spacing-top'>
          <input
            type='text'
            className='form-control'
            maxLength='512'
            name='q'
            ref='search'
            placeholder='Search...'
            defaultValue={ this.props.defaultValue }
          />
          <span className='input-group-btn'>
            <button className='btn btn-default' type='submit'>Search!</button>
          </span>
        </div>
      </form>
    );
  }
}

export default SearchBar;
