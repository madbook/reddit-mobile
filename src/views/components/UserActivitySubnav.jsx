import React from 'react';
import querystring from 'querystring';

import constants from '../../constants';

import BaseComponent from './BaseComponent';
import Dropdown from '../components/Dropdown';
import SortDropdown from '../components/SortDropdown';

const dropdownList = [
  {
    activity: 'comments',
    text: 'Submitted comments',
  },
  {
    activity: 'submitted',
    text: 'Submitted posts',
  },
  {
    activity: 'overview',
    text: 'Comments and posts',
  },
  {
    activity: 'gilded',
    text: 'Gilded',
  },
];

class UserActivitySubnav extends BaseComponent {
  static propTypes = {
    activity: React.PropTypes.string,
    name: React.PropTypes.string.isRequired,
    sort: React.PropTypes.string,
  };

  constructor(props) {
    super(props);

    this.state = {
      opened: false,
      sort: props.sort || 'hot',
      activity: props.activity || 'comments',
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

  _onOpen(bool) {
    this.setState({
      opened: bool,
    });
  }

  buildUrl(base, activity, sort, page) {
    var url = base;

    var q = {
      activity,
    };

    if (sort) {
      q.sort = sort;
    }

    if (page) {
      q.page = page;
    }

    return url + '?' + querystring.stringify(q);
  }

  render() {
    var baseUrl = `/u/${this.props.name}/activity`;
    var activity = this.state.activity;
    var sortList = 'userComments';

    switch (activity) {
      case 'listings':
        sortList = 'listings';
        break;
      case 'overview':
      case 'gilded':
        sortList = 'both';
        break;
    }

    var activityTitle = dropdownList.find((d) => {
      return d.activity === activity;
    }).text;

    var button = (
      <button className={ (this.state.opened ? ' opened' : '') }>
        { activityTitle } <span className='icon-caron'/>
      </button>
    );
    const { opened, sort, page } = this.state;

    // add user to the bar as well
    var user = this.props.user;
    if (user) {
      var loginLink = <a className='TopSubnav-a' href={ '/u/' + user.name }>{ user.name }</a>;
    } else {
      loginLink = (
        <a
          className='TopSubnav-a'
          href={ this.props.app.config.loginPath }
        >Log in / Register</a>
      );
    }

    return (
      <div className='TopSubnav'>
        <Dropdown
          id={ this._id }
          button={ button }
          app={ this.props.app }
          className='Dropdown-inline'
        >
          {
            dropdownList.map((d) => {
              var iconClass = opened && activity === d.activity ? 'icon-check-shown' :
                                                                  'icon-check-hidden';

              const url = this.buildUrl(baseUrl, d.activity, sort, page);
              return (
                <li className='Dropdown-li' key={ `ua-subnav-${d.text}` }>
                  <a
                    className='Dropdown-button'
                    href={ url }
                  >
                    <span className={ 'icon-check ' + iconClass }>{ ' ' }</span>
                    <span className='Dropdown-text'>{ d.text }</span>
                  </a>
                </li>
              );
            })
          }
        </Dropdown>

        <span className='text-muted'> sorted by </span>

        <SortDropdown
          app={ this.props.app }
          sort={ this.state.sort }
          list={ sortList }
          baseUrl={ this.buildUrl(baseUrl, this.state.activity) }
          className='Dropdown-inline'
        />

        <div className='pull-right'>{ loginLink }</div>
      </div>
    );
  }
}

export default UserActivitySubnav;
