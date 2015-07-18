import React from 'react';
import _ from 'lodash';
import debounce from 'lodash/function/debounce';
import globals from '../../globals';
import BaseComponent from './BaseComponent';

class SearchBar extends BaseComponent {
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
      <input type="text" className={"form-control zoom-fix" + customClass} maxLength="512" name="q" ref="search"
             placeholder="Search..." onChange={ debounce(this.handleInputChange, 500).bind(this) }
             defaultValue={this.props.query.q} />
    );
  }
}

//TODO: someone more familiar with this component could eventually fill this out better
SearchBar.propTypes = {
  className: React.PropTypes.string,
  inputChangedCallback: React.PropTypes.func.isRequired,
  query: React.PropTypes.shape({
    q: React.PropTypes.string,
  }).isRequired,
};

export default SearchBar;
