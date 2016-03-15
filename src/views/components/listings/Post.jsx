import React from 'react';

import propTypes from '../../../propTypes';
import constants from '../../../constants';

import {
  isPostDomainExternal,
  postShouldRenderMediaFullbleed,
} from './postUtils';

import BaseComponent from '../BaseComponent';
import PostHeader from './PostHeader';
import PostContent from './PostContent';
import PostFooter from './PostFooter';

const T = React.PropTypes;

function _isCompact(props) {
  return props.compact && !props.single;
}

export default class Post extends BaseComponent {
  static propTypes = {
    post: propTypes.listing.isRequired,
    app: T.object.isRequired,
    apiOptions: T.object.isRequired,
    user: propTypes.user,
    token: T.string,
    compact: T.bool.isRequired,
    hideComments: T.bool,
    hideSubredditLabel: T.bool,
    hideWhen: T.bool,
    subredditIsNSFW: T.bool,
    showOver18Interstitial: T.bool,
    single: T.bool,
    z: T.number,
    winWidth: T.number.isRequired,
    onDelete: T.func,
    toggleEdit: T.func,
    saveUpdatedText: T.func,
    editError: T.arrayOf(T.string),
    editing: T.bool,
  };

  static defaultProps = {
    z: 1,
    hideWhen: false,
    hideSubredditLabel: false,
    single: false,
    editing: false,
    onDelete: () => {},
    saveUpdatedText: () => {},
    toggleEdit: () => {},
  };

  constructor(props) {
    super(props);

    const compact = _isCompact(props);
    this.externalDomain = isPostDomainExternal(props.post);
    this.renderMediaFullbleed = postShouldRenderMediaFullbleed(props.post);
    this.forceHTTPS = this.shouldForceHTTPS(props.app);

    this.state = {
      compact,
      showNSFW: !props.showOver18Interstitial && props.subredditIsNSFW,
      expanded: false,
      loaded: false,
      reported: props.post.reported,
      hidden: props.post.hidden,
      width: props.winWidth,
      editing: false,
    };

    this.onReport = this.onReport.bind(this);
    this.onHide = this.onHide.bind(this);
    this.toggleExpanded = this.toggleExpanded.bind(this);
    this.toggleShowNSFW = this.toggleShowNSFW.bind(this);
    this.onResize = this.onResize.bind(this);
    this.loadContentIfNeeded = this.loadContentIfNeeded.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (typeof nextProps.compact !== 'undefined' || typeof nextProps.single !== 'undefined') {
      this.setState({compact: _isCompact(nextProps)});
    }
  }

  componentDidMount() {
    if (this.props.single) {
      this.loadContentIfNeeded();
      this.props.app.on(constants.RESIZE, this.onResize);
      this.onResize();
    }
  }

  componentWillUnmount() {
    if (this.props.single) {
      this.props.app.off(constants.RESIZE, this.onResize);
    }
  }

  onReport() {
    this.setState({ reported: true });
  }

  onHide() {
    this.setState({ hidden: true });
  }

  toggleExpanded(e) {
    e.preventDefault();
    this.setState({ expanded: !this.state.expanded });
  }

  toggleShowNSFW(e) {
    e.preventDefault();
    this.setState({ showNSFW: !this.state.showNSFW });
  }

  shouldForceHTTPS(app) {
    const config = app.config;
    return config.https || config.httpsProxy;
  }

  loadContentIfNeeded(windowOffset) {
    if (this.state.loaded) {
      return true;
    }

    if (!this.refs.rootNode) {
      return false;
    }

    const top = this.refs.rootNode.getBoundingClientRect().top;
    if (top < windowOffset) {
      this.setState({ loaded: true }, this.onResize);
      return true;
    }

    return false;
  }

  onResize() {
    const node = this.refs.rootNode;
    if (!node) {
      return;
    }

    const newState = {};
    newState.width = node.offsetWidth;
    this.setState(newState);
  }

  render() {
    const {
      showHidden,
    } = this.props;

    const {
      hidden,
      reported,
    } = this.state;

    if ((!showHidden && hidden) || reported) {
      return null;
    }

    const {
      user,
      post,
      app,
      token,
      apiOptions,
      single,
      hideSubredditLabel,
      hideWhen,
      onDelete,
      toggleEdit,
      saveUpdatedText,
      editError,
      editing,
    } = this.props;

    const {
      compact,
      showNSFW,
      expanded,
      z,
      width,
    } = this.state;

    const { externalDomain, renderMediaFullbleed, forceHTTPS } = this;

    let thumbnailOrNil;
    if (compact) {
      thumbnailOrNil = (
        <PostContent
          post={ post }
          single={ single }
          compact={ true }
          expandedCompact={ false }
          onTapExpand={ this.toggleExpanded }
          width={ width }
          toggleShowNSFW={ this.toggleShowNSFW }
          showNSFW={ showNSFW }
          editing={ false }
          toggleEditing={ toggleEdit }
          saveUpdatedText={ saveUpdatedText }
          forceHTTPS={ forceHTTPS }
          isDomainExternal={ externalDomain }
          renderMediaFullbleed={ renderMediaFullbleed }
        />
      );
    }

    const hasExpandedCompact = compact && expanded;
    let contentOrNil;
    if (!compact || hasExpandedCompact) {
      contentOrNil = (
        <PostContent
          post={ post }
          single={ single }
          compact={ compact }
          expandedCompact={ hasExpandedCompact }
          onTapExpand={ this.toggleExpanded }
          width={ width }
          showNSFW={ showNSFW }
          toggleShowNSFW={ this.toggleShowNSFW }
          editing={ editing }
          toggleEditing={ toggleEdit }
          saveUpdatedText={ saveUpdatedText }
          editError={ editError }
          forceHTTPS={ forceHTTPS }
          isDomainExternal={ externalDomain }
          renderMediaFullbleed={ renderMediaFullbleed }
        />
      );
    }

    const postCssClass = `Post ${compact ? 'size-compact' : 'size-default'}`;

    return (
      <article ref='rootNode' className={ postCssClass } style={ {zIndex: z} }>
        <div className='Post__header-wrapper'>
          { thumbnailOrNil }
          <PostHeader
            post={ post }
            single={ single }
            hideSubredditLabel={ hideSubredditLabel }
            hideWhen={ hideWhen }
            nextToThumbnail={ !!thumbnailOrNil }
            showingLink={ !!(compact && !hasExpandedCompact && externalDomain) }
            renderMediaFullbleed={ renderMediaFullbleed }
          />
        </div>
        { contentOrNil }
        <PostFooter
          user={ user }
          single={ single }
          post={ post }
          app={ app }
          token={ token }
          apiOptions={ apiOptions }
          viewComments={ !single }
          onReport={ this.onReport }
          onHide={ this.onHide }
          onEdit={ toggleEdit }
          onDelete={ onDelete }
        />
      </article>
    );
  }
}
