import React from 'react';
import _ from 'lodash';

class SearchBar extends React.Component {
  constructor(props) {
    super(props);
  }

  handleInputChange(e) {
    var searchEl = this.refs.search.getDOMNode();
    var value = searchEl.value.trim();

    if (value.length > 3) {
      var cb = this.props.inputChangedCallback || Function.prototype;
      cb({ value: value });
      this.props.app.emit('search', value);
    }
  }

  render() {
    return (
      <div className="SearchBar">
        <input type="text" className="form-control" maxLength="512" name="search" ref="search"
               placeholder="Search..." onChange={ _.debounce(this.handleInputChange, 500).bind(this) }
               defaultValue={this.props.query.q} />
      </div>
    );
  }
}

export default SearchBar;
