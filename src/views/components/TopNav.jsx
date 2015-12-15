import React from 'react';
import constants from '../../constants';
import { models } from 'snoode';

import BaseComponent from './BaseComponent';
import Logo from '../components/icons/Logo';
import SeashellsDropdown from '../components/SeashellsDropdown';
import SnooIcon from '../components/icons/SnooIcon';

class TopNav extends BaseComponent {
  constructor(props) {
    super(props);

    this.state = {
      subreddit: null,
      loaded: true,
      sideNavOpen: false,
    };

    this._onToggle = this._onToggle.bind(this);
    this._onSubscribeClick = this._onSubscribeClick.bind(this);
    this._onClick = this._onClick.bind(this, 'hamburger');
  }

  loadSubreddit(data) {
    this.setState({
      loaded: false,
    });

    data.then(function(data) {
      this.setState({
        subreddit: data,
        loaded: true,
      });
    }.bind(this));
  }

  componentWillReceiveProps(nextProps) {
    var {data, subredditName} = nextProps;
    var subPromise = data.get('subreddit');

    if (subredditName && subPromise && subredditName !== this.props.subredditName) {
      this.loadSubreddit(subPromise);
    } else if (!subredditName && this.state.subreddit) {
      this.setState({
        subreddit: null,
      });
    }
  }

  componentDidMount() {
    var {app, data, subredditName} = this.props;
    var subPromise = data.get('subreddit');
    if (subredditName && subPromise) {
      this.loadSubreddit(subPromise);
    }

    app.on(constants.SIDE_NAV_TOGGLE, this._onToggle);
  }

  componentWillUnmount() {
    this.props.app.off(constants.SIDE_NAV_TOGGLE, this._onToggle);
  }

  render() {
    var props = this.props;
    var title = props.subredditName || props.multi || props.userName;
    var link = props.topNavLink;
    var {subreddit} = this.state;
    var currentSub = '';

    if (props.subredditName) {
      currentSub = '/r/' + props.subredditName;
    }

    if (!title) {
      link = '/';
      title = <Logo />;
    }

    var subredditMenu;

    if (subreddit) {
      var isSubscribed = subreddit.user_is_subscriber;
      var subscribedClass = isSubscribed ? 'saved' : '';

      subredditMenu = (
        <SeashellsDropdown right={ true } app={ props.app }>
          <li className='Dropdown-li'>
            <a className='MobileButton Dropdown-button' href={ `/r/${props.subredditName}/about` }>
              <span className='icon-info-circled'> </span>
              <span className='Dropdown-text'>{ `About ${props.subredditName}` }</span>
            </a>
          </li>
          <li className='Dropdown-li'>
            <a
              className='MobileButton Dropdown-button'
              href={ `${props.config.reddit}/r/${props.subredditName}/wiki` }
              data-no-route='true'
            >
              <span className='icon-text-circled' > </span>
              <span className='Dropdown-text'>Wiki</span>
            </a>
          </li>
          <li className={ `Dropdown-li ${props.token ? '' : 'hidden'}` }>
            <button className='Mobilebutton Dropdown-button' onClick={ this._onSubscribeClick }>
              <span className={ 'icon-save-circled ' + subscribedClass }> </span>
              <span className='Dropdown-text'>
                { isSubscribed ? 'Unsubscribe' : 'Subscribe' }
              </span>
            </button>
          </li>
        </SeashellsDropdown>
      );
    }

    let notificationsCount;
    if (props.user && props.user.inbox_count) {
      notificationsCount = (
        <span className='badge badge-xs badge-orangered'>{ props.user.inbox_count }</span>
      );
    }

    var sideNavIcon = 'icon-hamburger';
    if (this.state.sideNavOpen) {
      sideNavIcon = 'icon-x';
    }

    return (
      <nav className={ 'TopNav' + (this.state.sideNavOpen ? ' opened' : '') }>
        <div className='pull-left TopNav-padding TopNav-left' key='topnav-menu'>
          <div className='TopNav-beta'>beta</div>
          <a className='MobileButton TopNav-padding TopNav-snoo' href='/'>
            <SnooIcon rainbow={ false }/>
          </a>
          <h1 className='TopNav-text TopNav-padding'>
            <span>
              <a className='TopNav-a' href={ link }>
                { title }
              </a>
            </span>
          </h1>
        </div>
        <div className='TopNav-padding TopNav-right' key='topnav-actions'>
          { subredditMenu }
          <a className='MobileButton TopNav-floaty' href={ `${currentSub}/submit` }>
            <span className='icon-post'>{ ' ' }</span>
          </a>
          <a
            className='MobileButton TopNav-floaty'
            href={ (props.subredditName ? `/r/${props.subredditName}` : '') + '/search' }
          >
            <span className='icon-search'></span>
          </a>
          <button
            className='MobileButton TopNav-floaty'
            onClick={ this._onClick }
          >
            <span className={ sideNavIcon }></span>
            { notificationsCount }
          </button>
        </div>
      </nav>
   );
  }

  _onSubscribeClick() {
    var state = this.state;

    if (state.subreddit) {
      var props = this.props;

      var subscription = new models.Subscription({
        action: state.subreddit.user_is_subscriber ? 'unsub' : 'sub',
        sr: state.subreddit.name,
      });

      var options = Object.assign({}, this.props.apiOptions, {
        model: subscription,
      });

      this.setState({
        subreddit: Object.assign({}, state.subreddit, {
          user_is_subscriber: !state.subreddit.user_is_subscriber,
        }),
      });

      // and send request to the server to do actual work
      props.app.api.subscriptions.post(options)
        .then(function (data) {
          // if it fails revert back to the original state
          if (Object.keys(data).length) {
            this.setState({
              subreddit: Object.assign(state.subreddit, {
                user_is_subscriber: !state.subreddit.user_is_subscriber,
              }),
            });

            this.props.app.render('/400', false);
          }
        }.bind(this));
    }
  }

  _onClick(str) {
    switch (str) {
      case 'hamburger':
        this.props.app.emit(constants.TOP_NAV_HAMBURGER_CLICK);
        break;
    }
  }

  _onToggle(bool) {
    this.setState({
      sideNavOpen: bool,
    });
  }
}

TopNav.propTypes = {
  multi: React.PropTypes.string,
  subredditName: React.PropTypes.string,
};

export default TopNav;
