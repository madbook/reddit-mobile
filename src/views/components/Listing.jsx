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
  };
  
  constructor(props) {
    super(props);

    const compact = _isCompact(props);

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
    const {
      app,
      apiOptions,
      user,
      token,
      single,
      toggleEdit,
      onDelete,
      listing,
      hideSubredditLabel,
    } = this.props;

    const {
      distinguished,
      subreddit,
      author,
    } = listing;

    const linkFlairText = listing.link_flair_text;

    let showEditAndDel = false;
    if (user && single) {
      showEditAndDel = (user.name === author);
    }


    const listingDropdownNode = (
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

    let nsfwNode;

    if (ListingContent.isNSFW(listing)) {
      nsfwNode = (
        <span className='Listing-link-flair label label-danger'>
          NSFW
        </span>
      );
    }

    let linkNode;

    if (linkFlairText) {
      linkNode = (
        <span
          className={ `Listing-link-flair label label-primary ${listing.link_flair_css_class}` }
        >
          { linkFlairText }
        </span>
      );
    }

    let flairNode;

    if (nsfwNode || linkNode) {
      flairNode = (
        <div className='Listing-flair link-flair-container vertical-spacing-top'>
          { nsfwNode }
          { linkNode }
        </div>
      );
    }

    let subredditNode;

    if (!hideSubredditLabel) {
      const srDetail = listing.sr_detail;
      let style;

      if (srDetail) {
        const keyColor = srDetail.key_color;

        if (keyColor) {
          style = { color: keyColor };
        }
      }

      subredditNode = subreddit ? (
        <a className='Listing-subreddit' href={ `/r/${subreddit}` }>
          <span style={ style }>r/{ subreddit }</span>
        </a>
      ) : null;
    }

    let row1Node;
    let row2Dropdown;

    if (subredditNode || flairNode) {
      row1Node = (
        <div className='Listing-header-row1'>
          { listing.locked
            ? <div className='Listing-lock icon-lock'/>
            : null }
          { subredditNode }
          { flairNode }
          { listingDropdownNode }
        </div>
      );
    } else {
      row2Dropdown = listingDropdownNode;
    }

    const distinguishedClass = distinguished ? ` text-${distinguished}` : '';

    const edited = listing.edited ? ' *' : '';

    const title = `${listing.title}${edited}`;

    return (
      <header className={ `Listing-header${(row2Dropdown ? ' single-row' : '')}` }>
        { row1Node }
        <div className={ 'Listing-header-row2' }>
          <a
            href={ mobilify(listing.url) }
            className={ `Listing-title${distinguishedClass}` }
          >
            { title }
          </a>
          { row2Dropdown }
        </div>
      </header>
    );
  }

  _renderFooter() {
    const {
      listing,
      single,
      hideWhen,
      hideDomain,
      hideComments,
      app,
      token,
      apiOptions,
      hideSubredditLabel,
    } = this.props;

    const {
      domain,
      promoted,
      gilded,
      num_comments,
      created_utc,
      subreddit,
    } = listing;

    let gildedNode;

    if (gilded && single) {
      gildedNode = (
        <li><span className='icon-gold-circled'/></li>
      );
    }

    let whenNode;

    if (!hideWhen) {
      whenNode = (<span className='Listing-when'>{ short(created_utc * 1000) }</span>);
    }

    let domainNode;

    if (promoted) {
      domainNode = (
        <span className='Listing-domain text-primary sponsored-label'>Sponsored</span>
      );
    } else if (domain && !hideDomain && domain.indexOf('self.') !== 0) {
      domainNode = (
        <span className='Listing-domain'>{ domain }</span>
      );
    }

    let commentsNode;

    if (!hideComments) {
      commentsNode = (
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

    const linkFlairText = listing.link_flair_text;
    const hasFlair =
      ListingContent.isNSFW(listing) ||
      linkFlairText ||
      (!hideSubredditLabel && subreddit);

    return (
      <footer className='Listing-footer'>
        <ul className='linkbar text-muted'>
          { !hasFlair && listing.locked
            ? <div className='Listing-lock-large listing-footer-icon icon-lock'/>
            : null }
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

  render() {
    const {
      width,
      compact,
      tallestHeight,
      loaded,
      expanded,
      hidden,
      reported,
      showNSFW,
    } = this.state;

    const {
      showHidden,
      single,
      editing,
      listing,
      toggleEdit,
      saveUpdatedText,
      editError,
      z,
    } = this.props;

    if ((!showHidden && hidden) || reported) {
      return null;
    }

    let expandedCompact;
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

    const listingClass = `Listing ${(compact ? 'compact' : 'card')}` +
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

    const newState = {};
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
}

export default Listing;
