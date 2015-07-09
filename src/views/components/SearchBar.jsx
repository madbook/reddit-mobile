import React from 'react';
import _ from 'lodash';
import globals from '../../globals';

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
      globals().app.emit('search', value);
    }
  }

  render() {
    var customClass = this.props.className || '';
    return (
      <input type="text" className={"form-control " + customClass} maxLength="512" name="q" ref="search"
             placeholder="Search..." onChange={ _.debounce(this.handleInputChange, 500).bind(this) }
             defaultValue={this.props.query.q} />
    );
  }
}

export default SearchBar;
