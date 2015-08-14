import React from 'react/addons';
import constants from '../../constants';
import globals from '../../globals';
import mobilify from '../../lib/mobilify';
import propTypes from '../../propTypes';
import short from '../../lib/formatDifference';

import AutoTween from '../components/AutoTween';
import BaseComponent from './BaseComponent';
import ListingContent from '../components/ListingContent';
import ListingDropdown from '../components/ListingDropdown';
import Vote from '../components/Vote';

var TransitionGroup = React.addons.TransitionGroup;

function isImgurDomain(domain) {
  return (domain || '').indexOf('imgur.com') >= 0;
}

function _isCompact(props) {
  return props.compact && !props.single;
}

class Listing extends BaseComponent {
  constructor(props) {
    super(props);

    var compact = _isCompact(props);
    this.state = {
      compact: compact,
      expanded: false,
      loaded: false,
      tallestHeight: 0,
      reported: false,
      hidden: false,
      width: (globals().winWidth || 300) - 10,
    };

    this.checkPos = this.checkPos.bind(this);
    this.resize = this.resize.bind(this);
    this.onReport = this.onReport.bind(this);
    this.onHide = this.onHide.bind(this);
    this.expand = this.expand.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (typeof nextProps.compact !== 'undefined' || typeof nextProps.single !== 'undefined') {
      this.setState({compact: _isCompact(nextProps)});
    }
  }

  onReport() {
    this.setState({ reported: true });
  }

  onHide() {
    this.setState({ hidden: true });
  }

  //build headline
  _renderHeadline() {
    var props = this.props;

    var listing = props.listing;
    var hideSubredditLabel = props.hideSubredditLabel;

    var distinguished = listing.distinguished;
    var linkFlairText = listing.link_flair_text;
    var subreddit = listing.subreddit;

    var showEdit = false;
    var showDel = false;

    if (props.user && props.single) {
      showEdit = (props.user.name === listing.author) && listing.is_self;
      showDel = props.user.name === listing.author;
    }


    var listingDropdownNode = (
      <ListingDropdown
        apiOptions={ props.apiOptions }
        app={ props.app }
        user={ props.user }
        token={ props.token }
        viewComments={ !props.single }
        listing={ listing }
        showHide={ true }
        saved={ listing.saved }
        subreddit={ listing.subreddit }
        showEdit={ showEdit }
        onEdit={ props.toggleEdit }
        onDelete={ props.onDelete }
        showDel={ showDel }
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
        <span className={ 'Listing-link-flair label label-primary ' + listing.link_flair_css_class }>
          { linkFlairText }
        </span>
      );
    }

    if (nsfwNode || linkNode) {
      var flairNode = <div className='Listing-flair link-flair-container vertical-spacing-top'>
        { nsfwNode }
        { linkNode }
      </div>;
    }

    if (!hideSubredditLabel) {
      var srDetail = listing.sr_detail;
      if (srDetail) {
        var iconImg = srDetail.icon_img;
        var keyColor = srDetail.key_color;
        if (keyColor) {
          var style = {color: keyColor};
        }
      }

      if (!this.state.compact) {
        if (iconImg) {
          var iconNode = (
            <div className='Listing-icon' style={ {backgroundImage: 'url(' + iconImg + ')'} }>
            </div>
          );
        } else {
          iconNode = <span className='icon-snoo-circled icon' />;
        }
      }

      var subredditNode = subreddit ? (
        <a className='Listing-subreddit' href={`/r/${subreddit}`}><span style={ style }>r/{ subreddit }</span></a>
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
      <header className={ 'Listing-header' + (row2Dropdown ? ' single-row' : '')}>
        { row1Node }
        <div className={ 'Listing-header-row2'}>
          <a href={ mobilify(listing.url) } className={ 'Listing-title' + ( distinguished ? ' text-' + distinguished : '') }>
            { listing.title + ' ' + (listing.edited ? '*' : '') }
          </a>
          { row2Dropdown }
        </div>
      </header>
    );
  }

  _renderFooter() {
    var props = this.props;

    var listing = props.listing;

    var domain = listing.domain;
    var numComments = listing.num_comments;

    if (listing.gilded && props.single) {
      var gildedNode = (
        <li><span className='icon-gold-circled'/></li>
      );
    }

    if (!props.hideWhen) {
      var whenNode = (<span className='Listing-when'>{ short(listing.created_utc * 1000) }</span>);
    }

    if (listing.promoted) {
      domainNode = (
        <span className='Listing-domain text-primary sponsored-label'>Sponsored</span>
      );
    } else if (domain.indexOf('self.') !== 0 && !props.hideDomain) {
      var domainNode = (
        <span className='Listing-domain'>{ domain }</span>
      );
    }

    if (!props.hideComments) {
      var commentsNode = (
        <li className='Listing-comments linkbar-item-no-seperator'>
          <a
            className='Listing-commentsbutton'
            href={ listing.cleanPermalink }>
            <span className='icon-comments-circled listing-footer-icon' />
            <span className='Listing-numcomments'>{ numComments }</span>
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
            app={ this.props.app }
            thing={ listing }
            token={ props.token }
            apiOptions={ props.apiOptions }
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
    var state = this.state;
    if (state.hidden) {
      return null;
    }

    var compact = state.compact;
    var props = this.props;

    if (compact && state.expanded && !props.single) {
      if (!this.key) {
        this.key = Math.random();
      }
      var expandedCompact = (
        <AutoTween key = { this.key }>
          <ListingContent expand = { this.expand }
                          expanded = { true }
                          width={ state.width }
                          tallestHeight={ state.tallestHeight }
                          loaded={ state.loaded }
                          { ...props }
                          expandedCompact={ true }
                          compact={ compact }
                          />
        </AutoTween>
      );
    }

    return (
      <article ref='root' style={ {zIndex: props.z || 1} } className={'Listing' + (compact ? ' compact' : '') + (props.listing.promoted ? ' Listing-sponsored' : '') }>
        <div className='Listing-content-holder'>
          { this._renderHeadline() }
          <ListingContent
                          isThumbnail={compact}
                          expand = { this.expand }
                          expanded = { state.expanded && !expandedCompact }
                          width={ state.width }
                          tallestHeight={ state.tallestHeight }
                          loaded={ state.loaded }
                          editing={this.props.editing}
                          toggleEdit={this.props.toggleEdit}
                          saveUpdatedText={this.props.saveUpdatedText}
                          editError={ this.props.editError }
                          { ...props }
                          compact={ compact }
                          />
          { this._renderFooter() }
        </div>
        <TransitionGroup>
          { expandedCompact }
        </TransitionGroup>
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
    var top = React.findDOMNode(this).getBoundingClientRect().top;
    if (top < winHeight) {
      this._loadContent();
      return true;
    }
    return false;
  }

  resize(width) {
    var state = this.state;
    var node = this.refs.root.getDOMNode();
    var newState = {};
    newState.width = width || node.offsetWidth;
    if (state.compact && state.loaded) {
      var height = node.offsetHeight;
      if (height > this.state.tallestHeight) {
        newState.tallestHeight = height;
      }
    }
    this.setState(newState);
  }

  expand(e) {
    e.preventDefault();
    this.setState({
      expanded: !this.state.expanded,
    });
  }

  _loadContent() {
    this.setState({loaded: true}, this.resize);
  }
}

Listing.propTypes = {
  // apiOptions: React.PropTypes.object,
  compact: React.PropTypes.bool,
  editError: React.PropTypes.arrayOf(React.PropTypes.string),
  editing: React.PropTypes.bool,
  hideComments: React.PropTypes.bool,
  hideDomain: React.PropTypes.bool,
  hideSubredditLabel: React.PropTypes.bool,
  hideWhen: React.PropTypes.bool,
  listing: propTypes.listing.isRequired,
  onDelete: React.PropTypes.func,
  saveUpdatedText: React.PropTypes.func,
  single: React.PropTypes.bool,
  toggleEdit: React.PropTypes.func,
  z: React.PropTypes.number,
};

export default Listing;
