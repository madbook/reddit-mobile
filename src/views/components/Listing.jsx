import React from 'react/addons';
import constants from '../../constants';
import mobilify from '../../lib/mobilify';
import short from '../../lib/formatDifference';
import CommentIcon from '../components/icons/CommentIcon';
import SnooIcon from '../components/icons/SnooIcon';
import ListingContent from '../components/ListingContent';
import ListingDropdown from '../components/ListingDropdown';
import MobileButton from '../components/MobileButton';
import Vote from '../components/Vote';

var TransitionGroup = React.addons.TransitionGroup;

function isImgurDomain(domain) {
  return (domain || '').indexOf('imgur.com') >= 0;
}

class Listing extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      compact: props.compact,
      expanded: false,
      loaded: false,
      tallestHeight: 0,
      reported: false,
      hidden: false,
      width: 0,
    };

    this._onCompactToggle = this._onCompactToggle.bind(this);
    this.checkPos = this.checkPos.bind(this);
    this.resize = this.resize.bind(this);
    this.onReport = this.onReport.bind(this);
    this.onHide = this.onHide.bind(this);
    this.expand = this.expand.bind(this);
  }

  onReport() {
    this.setState({ reported: true });
  }

  onHide() {
    this.setState({ hidden: true });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (nextProps !== this.props || nextState !== this.state);
  }

  //build headline
    _renderHeadline() {
      var props = this.props;

      var listing = props.listing;
      var hideSubredditLabel = props.hideSubredditLabel;

      var distinguished = listing.distinguished;
      var linkFlairText = listing.link_flair_text;
      var subreddit = listing.subreddit;

      var listingDropdownNode = (
        <ListingDropdown
          listing={ listing }
          app={ props.app }
          showHide={ true }
          saved={ listing.saved }
          subreddit={ listing.subreddit }
          onReport={ this.onReport }
          onHide={ this.onHide }
          token={ props.token }
          apiOptions={ props.apiOptions }
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
            var style = {color: '#f00'};
          }
        }

        if (!ListingContent.isCompact(props)) {
          if (iconImg) {
            var iconNode = (
              <div className='Listing-icon' style={ {backgroundImage: 'url(' + iconImg + ')'} }>
              </div>
            );
          } else {
            iconNode = <SnooIcon/>;
          }
        }

        var subredditNode = (
          <MobileButton className='Listing-subreddit' href={`/r/${subreddit}`}>
            { iconNode }
            <span style={ style }>r/{ subreddit }</span>
          </MobileButton>
        );
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

      if (domain.indexOf('self.') !== 0 && !props.hideDomain) {
        var domainNode = (
          <span className='Listing-domain'>{ domain }</span>
        );
      } else if (props.sponsored) {
        domainNode = (
          <span className='Listing-domain text-primary sponsored-label'>Sponsored</span>
        );
      }

      if (!props.hideComments) {
        var commentsNode = (
          <li className='Listing-comments linkbar-item-no-seperator'>
            <MobileButton className='Listing-commentsbutton' href={ listing.cleanPermalink }>
              <CommentIcon/>
              <span className='Listing-numcomments'>{ numComments }</span>
              { whenNode }
              { domainNode }
            </MobileButton>
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
              app={ props.app }
              thing={ listing }
              token={ props.token }
              api={ props.api }
              apiOptions={ props.apiOptions }
              loginPath={ props.loginPath }
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
        <ListingContent expand = { this.expand }
                        expanded = { state.expanded }
                        key = { this.key }
                        width={ state.width }
                        tallestHeight={ state.tallestHeight }
                        loaded={ state.loaded }
                        {...props}
                        expandedCompact={ true }
                        compact={ false }
                        />
      );
    }

    return (
      <article ref='root' className={'Listing' + (compact ? ' compact' : '') + (props.sponsored ? ' Listing-sponsored' : '') }>
        <div className='Listing-content-holder'>
          { this._renderHeadline() }
          <ListingContent expand = { this.expand }
                          expanded = { state.expanded && !expandedCompact }
                          width={ state.width }
                          tallestHeight={ state.tallestHeight }
                          loaded={ state.loaded }
                          {...props}/>
          { this._renderFooter() }
        </div>
        <TransitionGroup>
          { expandedCompact }
        </TransitionGroup>
      </article>
    );
  }

  componentDidMount() {
    this.props.app.on(constants.COMPACT_TOGGLE, this._onCompactToggle);
    if (this.props.single) {
      this._loadContent();
      this.props.app.on(constants.RESIZE, this.resize);
      this.resize();
    }
  }

  componentWillUnmount() {
    this.props.app.off(constants.COMPACT_TOGGLE, this._onCompactToggle);
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

  _onCompactToggle(state) {
    this.setState({compact: state});
  }
}

export default Listing;
