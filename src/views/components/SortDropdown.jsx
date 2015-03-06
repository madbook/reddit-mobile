import React from 'react';
import querystring from 'querystring';
import CheckmarkIconFactory from '../components/CheckmarkIcon';

var CheckmarkIcon;
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
    { text: 'random', param: 'random' },
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
      opened:false
    };
    this._onMouseEnter=this._onMouseEnter.bind(this);
    this._onMouseLeave=this._onMouseLeave.bind(this);
    this._onClick=this._onClick.bind(this);
    this._open=this._open.bind(this);
    this._close=this._close.bind(this);
  }

  render() {
    var list = _LISTS[this.props.list];
    var baseUrl = this.props.baseUrl || '/';
    if (baseUrl[baseUrl.length - 1] !== '/') {
      baseUrl += '/';
    }
    var touch=(typeof window!='undefined')?('ontouchstart' in window):false;
    var sort=this.props.sort;
    var opened=this.state.opened;
    return (
      <div className='SortDropdown' onMouseEnter={touch?null:this._onMouseEnter} onMouseLeave={touch?null:this._onMouseLeave} onClick={touch?this._onClick:null}>
        <button className={'twirly after' + (opened?' opened':'')} ref='twirly'>{_toTitleCase(sort)}</button>
        <div className='tab shadow' ref='tab'>
          <div className='stalagmite'></div>
          {
            list.map(function(map) {
              var url = baseUrl + '?' + querystring.stringify({
                sort: map.param.toLowerCase(),
              });

              return (
                <div className="line">
                  <CheckmarkIcon checked={opened && map.text == sort}/>
                  <a key={url} href={ url }>{ _toTitleCase(map.text) }</a>
                </div>
              );
            })
          }
        </div>
      </div>
    );
  }

  _onMouseEnter() {
    this._open();
  }

  _onMouseLeave() {
    this._close();
  }

  _onClick() {
    if(this.state.opened)
      this._close();
    else
      this._open();
  }

  _open() {
    TweenLite.to(this.refs.tab.getDOMNode(), 0.2, {autoAlpha:1, ease:Linear.easeNone});
    this.setState({opened:true});
  }

  _close() {
    TweenLite.to(this.refs.tab.getDOMNode(), 0.2, {autoAlpha:0, ease:Linear.easeNone, clearProps:'all'});
    this.setState({opened:false});
  }
}

function SortDropdownFactory(app) {
  CheckmarkIcon = CheckmarkIconFactory(app);
  return app.mutate('core/components/checkmarkIcon', SortDropdown);
}

export default SortDropdownFactory;