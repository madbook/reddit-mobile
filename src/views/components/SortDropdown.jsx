import React from 'react';
import querystring from 'querystring';
import titleCase from '../../lib/titleCase';
import constants from '../../constants';

import CheckmarkIconFactory from '../components/icons/CheckmarkIcon';
var CheckmarkIcon;

import DropdownFactory from '../components/Dropdown';
var Dropdown;

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
    {text: 'hot', param: 'hot'},
    {text: 'controversial', param: 'controversial'},
    {text: 'old', param: 'old'},
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

class SortDropdown extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      opened: false,
    };

    this._onOpen = this._onOpen.bind(this);
    this._id = Math.random();
  }

  componentDidMount() {
    this.props.app.on(constants.DROPDOWN_OPEN + ':' + this._id, this._onOpen);
  }

  componentWillUnmount() {
    this.props.app.off(constants.DROPDOWN_OPEN + ':' + this._id, this._onOpen);
  }

  render() {
    var list = _LISTS[this.props.list];

    var baseUrl = this.props.baseUrl || '/';

    var sort = list.find((l) => {
      return l.param === this.props.sort;
    }) || list[0];

    var sortTitle = titleCase(sort.text);

    var sortParam = this.props.sortParam || 'sort';
    var opened = this.state.opened;
    var button = <button className={(opened ? ' opened' : '')}>{sortTitle} <span className='icon-caron'/></button>;

    return (
      <Dropdown app={ this.props.app } id={ this._id } button={ button } className={ this.props.className }>
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

            return (
              <li className='Dropdown-li' key={ url }>
                <a className='Dropdown-button' href={ url }>
                  <CheckmarkIcon played={opened && map.text === sortTitle.toLowerCase()}/>
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

function SortDropdownFactory(app) {
  CheckmarkIcon = CheckmarkIconFactory(app);
  Dropdown = DropdownFactory(app);
  return app.mutate('core/components/SortDropdown', SortDropdown);
}

export default SortDropdownFactory;
