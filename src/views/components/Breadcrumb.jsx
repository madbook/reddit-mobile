import React from 'react';
import querystring from 'querystring';

var lists = {
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

function shorten (text, len) {
  if (text.length > 15) {
    text = text.substr(0, Math.min(13,len-2)) + '…';
  }

  return text;
}

class Breadcrumb extends React.Component {
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate (nextProps, nextState) {
    return (nextProps !== this.props || nextState !== this.state);
  }

  render () {
    var subredditBreadcrumb;
    var list = lists[this.props.list];

    var subredditName = shorten(this.props.subredditName || '', 20);
    var baseUrl = this.props.baseUrl || '/';

    if (this.props.subredditName) {
      subredditBreadcrumb = (
        <li className='brand-title'>
          <a href={ '/r/' + subredditName }>{ subredditName }</a>
        </li>
      );
    } else {
      subredditBreadcrumb = (
        <li className='brand-title'>
          <a href='/'>reddit</a>
        </li>
      );
    }

    if (baseUrl[baseUrl.length - 1] !== '/') {
      baseUrl += '/';
    }

    return (
      <div className='navbar navbar-xs navbar-secondary'>
        <ul className='nav navbar-nav'>
          { subredditBreadcrumb }
        </ul>

        <ul className="nav navbar-nav navbar-right">
          <li>
            <button type='button' className='btn btn-link dropdown-toggle text-muted' data-toggle='dropdown' aria-expanded='false'>
              { this.props.sort } <span className='caret'></span>
            </button>
            <ul className='dropdown-menu dropdown-menu-right' role='menu'>
              {
                list.map(function(map) {
                  var url = baseUrl + '?' + querystring.stringify({
                    sort: map.param,
                  });

                  return (
                    <li key={url}><a href={ url }>{ map.text }</a></li>
                  );
                })
              }
            </ul>
          </li>

          <li>
            <button className='btn btn-link text-muted'>
              <span className='glyphicon glyphicon-pencil' />
            </button>
          </li>
          <li>
            <button className='btn btn-link text-muted'>
              <span className='glyphicon glyphicon-search' />
            </button>
          </li>
        </ul>
      </div>
    );
  }
}

function BreadcrumbFactory(app) {
  return app.mutate('core/components/navBar', Breadcrumb);
}

export default BreadcrumbFactory;