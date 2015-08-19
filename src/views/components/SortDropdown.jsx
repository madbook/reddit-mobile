import React from 'react';
import constants from '../../constants';
import globals from '../../globals';
import querystring from 'querystring';
import titleCase from '../../lib/titleCase';

import Dropdown from '../components/Dropdown';
import BaseComponent from './BaseComponent';

var _LISTS = {
  listings: [
    {text: 'hot', param: 'hot'},
    {text: 'new', param: 'new'},
    {text: 'rising', param: 'rising'},
    {text: 'controversial', param: 'controversial'},
    {text: 'top', param: 'top'},
    {text: 'gilded', param: 'gilded'},
  ],

  comments: [
    {text: 'best', param: 'confidence'},
    {text: 'top', param: 'top'},
    {text: 'new', param: 'new'},
    {text: 'controversial', param: 'controversial'},
    {text: 'old', param: 'old'},
    {text: 'q&a', param: 'qa'},
  ],

  both: [
    {text: 'hot', param: 'hot'},
    {text: 'top', param: 'top'},
    {text: 'controversial', param: 'controversial'},
  ],

  search: [
    {text: 'relevance', param: 'relevance'},
    {text: 'new', param: 'new'},
    {text: 'hot', param: 'hot'},
    {text: 'top', param: 'top'},
    {text: 'comments', param: 'comments'},
  ],

  time: [
    {text: 'all time', param: 'all'},
    {text: 'past year', param: 'year'},
    {text: 'past month', param: 'month'},
    {text: 'past week', param: 'week'},
    {text: 'past day', param: 'day'},
    {text: 'past hour', param: 'hour'},
  ],
};

class SortDropdown extends BaseComponent {
  constructor(props) {
    super(props);

    this.state = {
      opened: false,
    };

    this._onOpen = this._onOpen.bind(this);
    this._id = Math.random();
  }

  componentDidMount() {
    globals().app.on(constants.DROPDOWN_OPEN + ':' + this._id, this._onOpen);
  }

  componentWillUnmount() {
    globals().app.off(constants.DROPDOWN_OPEN + ':' + this._id, this._onOpen);
  }

  render() {
    var excludedSorts = this.props.excludedSorts || [];
    var list = _LISTS[this.props.list];

    if (excludedSorts.length) {
      list = list.filter(l => {
        return !excludedSorts.includes(l.param);
      });
    }

    var baseUrl = this.props.baseUrl || '/';

    var sort = list.find((l) => {
      return l.param === this.props.sort;
    }) || list[0];

    var sortTitle = titleCase(sort.text);

    var sortParam = this.props.sortParam || 'sort';
    var opened = this.state.opened;
    var button = <button className={(opened ? ' opened' : '')}>{sortTitle} <span className='icon-caron'/></button>;

    return (
      <Dropdown
        id={ this._id }
        button={ button }
        className={ this.props.className }>
        {
          list.map(function(map) {
            var url = baseUrl;

            if (baseUrl.indexOf('?') === -1) {
              url += '?' + querystring.stringify({
                [sortParam]: map.param.toLowerCase(),
              });
            } else {
              url += '&' + querystring.stringify({
                [sortParam]: map.param.toLowerCase(),
              });
            }
            var iconClass = opened && map.text === sortTitle.toLowerCase() ? 'icon-check-shown' : 'icon-check-hidden';
            return (
              <li className='Dropdown-li' key={ url }>
                <a className='Dropdown-button' href={ url }>
                  <span className={'icon-check ' + iconClass }>{' '}</span>
                  <span className='Dropdown-text'>{ titleCase(map.text) }</span>
                </a>
              </li>
            );
          })
        }
      </Dropdown>
    );
  }

  _onOpen(bool) {
    this.setState({opened: bool});
  }
}

SortDropdown.propTypes = {
  baseUrl: React.PropTypes.string,
  className: React.PropTypes.string,
  excludedSorts: React.PropTypes.arrayOf(React.PropTypes.string),
  list: React.PropTypes.string.isRequired,
  sort: React.PropTypes.string.isRequired,
  sortParam: React.PropTypes.string,
};

export default SortDropdown;
