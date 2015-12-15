import React from 'react';
import process from 'reddit-text-js';
import propTypes from '../../propTypes';

import BaseComponent from './BaseComponent';
import Loading from '../components/Loading';
import SearchBar from '../components/SearchBar';
import SeashellsDropdown from '../components/SeashellsDropdown';

const _searchLimit = 25;

class SubredditSelectionButton extends BaseComponent {
  constructor(props) {
    super(props);

    this.state = {
      subs: props.subscriptions || [],
      lastQuery: '',
      submitRules: {
        name: '',
        text: '',
      },
      loaded: true,
    };

    this.onSearch = this.onSearch.bind(this);
    this.toggle = this.toggle.bind(this);
    this.goToAbout = this.goToAbout.bind(this);
    this.openSubmitRules = this.openSubmitRules.bind(this);
    this._handleSelect = this._handleSelect.bind(this);
    this.getSub = this.getSub.bind(this);
  }

  onSearch (newVal) {
    if (newVal === this.state.lastQuery) {
      return;
    }

    this.setState({
      lastQuery: newVal,
    });

    var api = this.props.app.api;

    var options = api.buildOptions(this.props.apiOptions);
    options.query.type = ['sr'];
    options.query.limit = _searchLimit;
    options.query.q = newVal;

    api.search.get(options).then(function (data={}) {
      if (data.body && data.body.subreddits) {
        var newSubs = data.body.subreddits.map((sub) => {
          return {
            display_name: sub.display_name,
            icon_img: sub.icon_img,
            icon_size: sub.icon_size,
            submit_text: sub.submit_text,
          };
        });

        this.setState({
          subs: newSubs, loaded: true,
        });
      }
    }.bind(this));
    this.setState({loaded: false});
  }

  _handleSelect (e) {
    const sub = this.getSub(e.currentTarget);

    this.props.changeSubreddit(sub.display_name);
  }

  toggle () {
    this.props.toggleOpen();
  }

  getSub(currentTarget) {
    return this.state.subs[parseInt(currentTarget.dataset.index)];
  }

  openSubmitRules (e) {
    const { submit_text, display_name } = this.getSub(e.currentTarget);

    if (this.state.submitRules.name === display_name) {
      this.setState({submitRules: {name: '', text: ''}});
    } else {
      this.setState({
        submitRules: {
          text: submit_text,
          name: display_name,
        },
      });
    }
  }

  goToAbout(e) {
    const sub = this.getSub(e.currentTarget);

    this.props.goToAboutPage(sub.display_name);
  }

  render () {
    var props = this.props;
    var content;

    if (this.state.loaded) {
      content = this.state.subs.map(function(sub, i) {
        var expandContent;
        if (this.state.submitRules.name === sub.display_name) {
          var text = this.state.submitRules.text || 'No rules specified...';
          expandContent = (
            <div className='container sub-selection-rules'>

              <div dangerouslySetInnerHTML={ {__html: process(text)} } />
              <button
                type='button'
                data-index={ i }
                onClick={ this._handleSelect }
                className='btn btn-primary pull-right'
              >Submit to { sub.display_name }</button>
            </div>
          );
        }

        return (
          <div className='sub-selection-option' key={ sub.display_name }>
            <button type='button'
              className='sub-selection-btn'
              data-index={ i }
              onClick={ this.openSubmitRules }
            >
              <span className='sub-icon-placeholder'></span>{ sub.display_name }
            </button>
            <div className='sub-selection-menu pull-right'>
              <SeashellsDropdown right={ true } app={ props.app }>
                <li className='Dropdown-li'>
                  <button
                    type='button'
                    className='Dropdown-button'
                    data-index={ i }
                    onClick={ this.goToAbout }
                  >
                    <span
                      className='Dropdown-text'
                    >About this community</span>
                </button>
                </li>
              </SeashellsDropdown>
            </div>
            { expandContent }
          </div>
          );
      }.bind(this));
    } else {
      content = (
        <Loading />
      );
    }

    if (props.open) {
      return (
          <div>
            <div className='Submit-header'>
              <div className='Submit-centered'>
                <button
                  type='button'
                  className='close pull-left'
                  onClick={ this.toggle }
                >
                  <span className='Submit-close' aria-hidden='true'>&times;</span>
                </button>
                <span className='Submit-header-text'>Choose a community</span>
              </div>
            </div>
            <div className='sub-selection-wrapper Submit-centered'>
              <div className='Submit-search-holder'>
                <SearchBar
                  onSearch={ this.onSearch }
                  defaultValue={ this.props.ctx.query.q }
                />
              </div>
              { content }
            </div>
          </div>
        );
    } else {
      return (
        <div className="sub-selection-selected">
          <div className='Submit-centered'>
            <span onClick={ this.toggle } className='text-muted submit-posting-to' >
              Posting to: &nbsp;
              <button type='button' className={ this.props.errorClass }>
                { props.subreddit }
                <span className='icon-caron'/>
              </button>
            </span>
          </div>
        </div>
      );
    }
  }
}

SubredditSelectionButton.propTypes = {
  // apiOptions: React.PropTypes.object,
  changeSubreddit: React.PropTypes.func.isRequired,
  errorClass: React.PropTypes.string.isRequired,
  goToAboutPage: React.PropTypes.func,
  open: React.PropTypes.bool.isRequired,
  subreddit: React.PropTypes.string.isRequired,
  subscriptions: propTypes.subscriptions,
  toggleOpen: React.PropTypes.func.isRequired,
};

export default SubredditSelectionButton;
