import React from 'react';

import constants from '../../constants';
import mobilify from '../../lib/mobilify';
import propTypes from '../../propTypes';
import short from '../../lib/formatDifference';

import BaseComponent from './BaseComponent';
import ListingContent from '../components/ListingContent';
import ListingDropdown from '../components/ListingDropdown';
import Vote from '../components/Vote';

const PropTypes = React.PropTypes;

// this is called in a commented out section below
// function isImgurDomain(domain) {
//   return (domain || '').indexOf('imgur.com') >= 0;
// }

function _isCompact(props) {
  return props.compact && !props.single;
}

class Listing extends BaseComponent {
  constructor(props) {
    super(props);

    var compact = _isCompact(props);

    this.state = {
      compact,
      expanded: false,
      showNSFW: !props.showOver18Interstitial && props.subredditIsNSFW,
      loaded: false,
      tallestHeight: 0,
      reported: props.listing.reported,
      hidden: props.listing.hidden,
      width: (props.winWidth || 300) - 10,
    };

    this.checkPos = this.checkPos.bind(this);
    this.resize = this.resize.bind(this);
    this.onReport = this.onReport.bind(this);
    this.onHide = this.onHide.bind(this);
    this.toggleExpanded = this.toggleExpanded.bind(this);
    this.toggleShowNSFW = this.toggleShowNSFW.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (typeof nextProps.compact !== 'undefined' || typeof nextProps.single !== 'undefined') {
      this.setState({compact: _isCompact(nextProps)});
    }
  }

  onReport() {
    console.log('setting reported state');
    this.setState({ reported: true });
  }

  onHide() {
    this.setState({ hidden: true });
  }

  //build headline
  _renderHeadline() {
    let { app, apiOptions, user, token, single, toggleEdit, onDelete,
          listing, hideSubredditLabel } = this.props;

    let { distinguished, subreddit, author } = listing;
    var linkFlairText = listing.link_flair_text;

    let showEditAndDel = false;
    if (user && single) {
      showEditAndDel = (user.name === author);
    }


    var listingDropdownNode = (
      <ListingDropdown
        apiOptions={ apiOptions }
        app={ app }
        user={ user }
        token={ token }
        viewComments={ !single }
        listing={ listing }
        showHide={ true }
        saved={ listing.saved }
        subreddit={ listing.subreddit }
        showEditAndDel={ showEditAndDel }
        onEdit={ toggleEdit }
        onDelete={ onDelete }
        onReport={ this.onReport }
        onHide={ this.onHide }
      />
    );

    if (ListingContent.isNSFW(listing)) {
      var nsfwNode = (
        <span className='Listing-link-flair label label-danger'>
          NSFW
        </span>
      );
    }

    if (linkFlairText) {
      var linkNode = (
        <span
          className={ 'Listing-link-flair label label-primary ' + listing.link_flair_css_class }
        >
          { linkFlairText }
        </span>
      );
    }

    if (nsfwNode || linkNode) {
      var flairNode = (
        <div className='Listing-flair link-flair-container vertical-spacing-top'>
          { nsfwNode }
          { linkNode }
        </div>
      );
    }

    if (!hideSubredditLabel) {
      var srDetail = listing.sr_detail;
      if (srDetail) {
        var keyColor = srDetail.key_color;
        if (keyColor) {
          var style = {color: keyColor};
        }
      }

      var subredditNode = subreddit ? (
        <a className='Listing-subreddit' href={ `/r/${subreddit}` }>
          <span style={ style }>r/{ subreddit }</span>
        </a>
      ) : null;
    }

    if (subredditNode || flairNode) {
      var row1Node = (
        <div className='Listing-header-row1'>
          { subredditNode }
          { flairNode }
          { listingDropdownNode }
        </div>
      );
    } else {
      var row2Dropdown = listingDropdownNode;
    }

    return (
      <header className={ 'Listing-header' + (row2Dropdown ? ' single-row' : '') }>
        { row1Node }
        <div className={ 'Listing-header-row2' }>
          <a
            href={ mobilify(listing.url) }
            className={ 'Listing-title' + (distinguished ? ' text-' + distinguished : '') }
          >
            { listing.title + ' ' + (listing.edited ? '*' : '') }
          </a>
          { row2Dropdown }
        </div>
      </header>
    );
  }

  _renderFooter() {
    let { listing, single, hideWhen, hideDomain, hideComments,
          app, token, apiOptions } = this.props;

    let { domain, promoted, gilded, num_comments,
          created_utc } = listing;

    if (gilded && single) {
      var gildedNode = (
        <li><span className='icon-gold-circled'/></li>
      );
    }

    if (!hideWhen) {
      var whenNode = (<span className='Listing-when'>{ short(created_utc * 1000) }</span>);
    }

    var domainNode;

    if (promoted) {
      domainNode = (
        <span className='Listing-domain text-primary sponsored-label'>Sponsored</span>
      );
    } else if (domain && !hideDomain && domain.indexOf('self.') !== 0) {
      domainNode = (
        <span className='Listing-domain'>{ domain }</span>
      );
    }

    if (!hideComments) {
      var commentsNode = (
        <li className='Listing-comments linkbar-item-no-seperator'>
          <a
            className='Listing-commentsbutton'
            href={ listing.cleanPermalink }
          >
            <span className='icon-comments-circled listing-footer-icon' />
            <span className='Listing-numcomments'>{ num_comments }</span>
            { whenNode }
            { domainNode }
          </a>
        </li>
      );
    }

    return (
      <footer className='Listing-footer'>
        <ul className='linkbar text-muted'>
          { commentsNode }
          { gildedNode }
        </ul>
        <div className='Listing-vote'>
          <Vote
            app={ app }
            thing={ listing }
            token={ token }
            apiOptions={ apiOptions }
          />
        </div>
      </footer>
    );
  }

  //build image credit
    /*_renderImageCredit() {
      var props = this.props;
      var state = this.state;
      var listing = props.listing;
      var domain = listing.domain;
      var url = listing.url;

      if (!state.compact && state.expanded || props.single) {
        var u = isImgurDomain(domain) ? url.replace(ListingContent.imgMatch, '') : url;
        return (
          <div className="external-image-meta">
            <span>{ domain }</span>
            <span> | </span>
            <a href={ u } data-no-route="true">{ u }</a>
          </div>
        );
      }
    }*/

  render() {
    var { width, compact, tallestHeight, loaded, expanded,
          hidden, reported, showNSFW } = this.state;
    var { showHidden, single, editing, listing, toggleEdit, saveUpdatedText,
          editError, z} = this.props;

    if ((!showHidden && hidden) || reported) {
      return null;
    }

    var expandedCompact;
    if (compact && expanded && !single) {
      if (!this.key) {
        this.key = Math.random();
      }
      expandedCompact = (
        <ListingContent
          expand = { this.toggleExpanded }
          expanded = { true }
          width={ width }
          showNSFW={ true }
          tallestHeight={ tallestHeight }
          loaded={ loaded }
          { ...this.props }
          expandedCompact={ true }
          compact={ compact }
        />
      );
    }

    var listingClass = `Listing ${(compact ? 'compact' : '')}` +
      `${(listing.promoted ? ' Listing-sponsored' : '')}`;

    return (
      <article
        ref='root'
        style={ {zIndex: z || 1} }
        className={ listingClass }
      >
        <div className='Listing-content-holder'>
          { this._renderHeadline() }
          <ListingContent
            showNSFW={ showNSFW }
            toggleShowNSFW={ this.toggleShowNSFW }
            isThumbnail={ compact }
            expand = { this.toggleExpanded }
            expanded = { expanded && !expandedCompact }
            width={ width }
            tallestHeight={ tallestHeight }
            loaded={ loaded }
            editing={ editing }
            toggleEdit={ toggleEdit }
            saveUpdatedText={ saveUpdatedText }
            editError={ editError }
            { ...this.props }
            compact={ compact }
          />
          { this._renderFooter() }
        </div>
        { expandedCompact }
      </article>
    );
  }

  componentDidMount() {
    if (this.props.single) {
      this._loadContent();
      this.props.app.on(constants.RESIZE, this.resize);
      this.resize();
    }
  }

  componentWillUnmount() {
    if (this.props.single) {
      this.props.app.off(constants.RESIZE, this.resize);
    }
  }

  checkPos(winHeight) {
    if (this.state.loaded) {
      return true;
    }

    const top = this.domNode.getBoundingClientRect().top;

    if (top < winHeight) {
      this._loadContent();
      return true;
    }

    return false;
  }

  resize() {
    const state = this.state;
    const node = this.refs.root;

    let newState = {};
    let height;

    newState.width = node.offsetWidth;
    if (state.compact && state.loaded) {
      height = node.offsetHeight;
      if (height > this.state.tallestHeight) {
        newState.tallestHeight = height;
      }
    }

    this.setState(newState);
  }

  toggleExpanded(e) {
    e.preventDefault();
    this.setState({
      expanded: !this.state.expanded,
    });
  }

  toggleShowNSFW(e) {
    e.preventDefault();
    this.setState({
      showNSFW: !this.state.showNSFW,
    });
  }

  _loadContent() {
    this.setState({loaded: true}, this.resize);
  }

  static propTypes = {
    apiOptions: PropTypes.object,
    compact: PropTypes.bool,
    editError: PropTypes.arrayOf(PropTypes.string),
    editing: PropTypes.bool,
    hideComments: PropTypes.bool,
    hideDomain: PropTypes.bool,
    hideSubredditLabel: PropTypes.bool,
    hideWhen: PropTypes.bool,
    listing: propTypes.listing.isRequired,
    onDelete: PropTypes.func,
    saveUpdatedText: PropTypes.func,
    single: PropTypes.bool,
    toggleEdit: PropTypes.func,
    z: PropTypes.number,
  }
}

export default Listing;
