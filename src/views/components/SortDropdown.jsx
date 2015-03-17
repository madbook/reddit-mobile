import React from 'react';
import querystring from 'querystring';
import CheckmarkIconFactory from '../components/CheckmarkIcon';
var CheckmarkIcon;
import DropdownFactory from '../components/Dropdown';
var Dropdown;

var _LISTS = {
  listings: [
    { text: 'hot', param: 'hot' },
    { text: 'new', param: 'new' },
    { text: 'rising', param: 'rising' },
    { text: 'controversial', param: 'controversial' },
    { text: 'top', param: 'top' },
    { text: 'gilded', param: 'gilded' },
  ],

  comments: [
    { text: 'best', param: 'confidence' },
    { text: 'top', param: 'top' },
    { text: 'new', param: 'new' },
    { text: 'hot', param: 'hot' },
    { text: 'controversial', param: 'controversial' },
    { text: 'old', param: 'old' },
  ],
};

function _toTitleCase(str)
{
  return str.toLowerCase().replace(/\b[a-z]/g, function(letter) {return letter.toUpperCase();});
}

class SortDropdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      opened:false,
    };
    this._onOpen=this._onOpen.bind(this);
    this._id = Math.random();
  }

  componentDidMount () {
    this.props.app.on(Dropdown.OPEN + ':' + this._id, this._onOpen);
  }

  componentWillUnmount () {
    this.props.app.off(Dropdown.OPEN + ':' + this._id, this._onOpen);
  }

  render () {
    var list = _LISTS[this.props.list];
    var baseUrl = this.props.baseUrl || '/';
    if (baseUrl[baseUrl.length - 1] !== '/') {
      baseUrl += '/';
    }
    var sort = this.props.sort;
    var button = <button className={'twirly after' + ( this.state.opened ? ' opened' : '' )}>{_toTitleCase( sort )}</button>;
    return (
      <Dropdown app={ this.props.app } id={ this._id } button={ button }>
        {
          list.map(function(map) {
            var url = baseUrl + '?' + querystring.stringify({
              sort: map.param.toLowerCase(),
            });
            return (
              <li className='Dropdown-li' key={ url }>
                <a className='Dropdown-button' href={ url }>
                  <CheckmarkIcon opened={map.text == sort}/>
                  <span className='Dropdown-text'>{ _toTitleCase(map.text) }</span>
                </a>
              </li>
            );
          })
        }
      </Dropdown>
    );
  }

  _onOpen ( bool ) {
    this.setState({opened:bool});
  }
}

function SortDropdownFactory(app) {
  CheckmarkIcon = CheckmarkIconFactory(app);
  Dropdown = DropdownFactory(app);
  return app.mutate('core/components/SortDropdown', SortDropdown);
}

export default SortDropdownFactory;
