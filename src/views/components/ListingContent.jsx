import React from 'react';
import has from 'lodash/object/has';
import URL from 'url';

import mobilify from '../../lib/mobilify';
import propTypes from '../../propTypes';
import BaseComponent from './BaseComponent';

const PropTypes = React.PropTypes;
const _gfyRegex = /https?:\/\/(?:.+)\.gfycat.com\/(.+)\.gif/;
const _DEFAULT_ASPECT_RATIO = 16 / 9;

function _gifToHTML5(url) {
  if (!url || url.indexOf('.gif') < 1) {
    return;
  }
  // If it's imgur, make a gifv link
  if (url.indexOf('imgur.com') > -1) {
    return {
      webm: url.replace(/\.gif/, '.webm'),
      mp4: url.replace(/\.gif/, '.mp4'),
      poster: url.replace(/\.gif/, 'h.jpg'),
    };
  } else if (url.indexOf('gfycat') > 8) {
    var gfy = _gfyRegex.exec(url);

    if (gfy.length === 2) {
      return {
        iframe: url,
      };
    }
  }
}

//there are css values in aspect-ratio.less that must correlate with _WIDEST and _TALLEST
const _WIDEST = 3;
const _TALLEST = 1 / 3;
function _limitAspectRatio(aspectRatio) {
  return Math.min(Math.max(_TALLEST, aspectRatio), _WIDEST);
}

//there are css values in aspect-ratio.less that must correlate with _INCREMENT and _HEIGHT
const _INCREMENT = 40;
const _HEIGHT = 1080;

// Calculate the lowest common denominator
function euclid (a, b) {
  if (b === 0) {
    return a;
  }

  return euclid(b, a % b);
}

// Get a number rounded to the nearest increment
function incrRound (n, incr) {
  return Math.round(n / incr) * incr;
}

function _aspectRatioClass(ratio) {
  if (!ratio) {
    return 'aspect-ratio-16x9';
  }

  const w = incrRound(ratio * _HEIGHT, _INCREMENT);
  const lcd = euclid(w, _HEIGHT);

  return `aspect-ratio-${(w / lcd)}x${(_HEIGHT / lcd)}`;
}

// Allow links to pass through in selftext
function _wrapSelftextExpand(fn) {
  return function(e) {
    if (e.target.tagName !== 'A') {
      fn(e);
    }
  };
}

function _isPlayable(listing) {
  let media = listing.media;
  if (listing.url && listing.url.indexOf('.gif') > -1 ||
      (media && media.oembed && media.oembed.type !== 'image')
     ) {
    return true;
  }

  return false;
}

function forceProtocol(url, https) {
  let urlObj = URL.parse(url);
  urlObj.protocol = https ? 'https:' : urlObj.protocol;
  return URL.format(urlObj);
}

class ListingContent extends BaseComponent {
  static propTypes = {
    compact: PropTypes.bool,
    editError: PropTypes.arrayOf(PropTypes.string),
    editing: PropTypes.bool,
    expand: PropTypes.func.isRequired,
    expanded: PropTypes.bool.isRequired,
    expandedCompact: PropTypes.bool,
    isThumbnail: PropTypes.bool,
    listing: propTypes.listing.isRequired,
    loaded: PropTypes.bool.isRequired,
    saveUpdatedText: PropTypes.func,
    single: PropTypes.bool,
    tallestHeight: PropTypes.number.isRequired,
    toggleEdit: PropTypes.func,
    width: PropTypes.number.isRequired,
  };
  
  constructor(props) {
    super(props);

    // we want things to autoplay in expanded compact mode
    this.state.playing = props.expandedCompact ? true : false;

    this._togglePlaying = this._togglePlaying.bind(this);
    this.saveText = this.saveText.bind(this);
  }

  render() {
    const contentNode = this.buildContent();
    if (contentNode) {
      const {compact, expandedCompact} = this.props;

      let stalactiteNode;
      if (!compact && !expandedCompact) {
        stalactiteNode = <div className='stalactite'/>;
      }

      return (
        <div ref='all' className={ 'ListingContent' + (this._isCompact() ? ' compact' : '') }>
          { stalactiteNode }
          { contentNode }
        </div>
      );

    }

    return null;
  }

  buildContent() {
    let props = this.props;
    let listing = props.listing;

    let expanded = this._isExpanded();
    let isNSFW = ListingContent.isNSFW(listing);
    let isPlayable = _isPlayable(listing);

    let oembed = listing.media ? listing.media.oembed : null;
    let url = mobilify(listing.url || listing.cleanPermalink);

    let preview;
    if (listing.preview || oembed) {
      preview = this._previewImage(isNSFW, oembed, props.showNSFW);
    }

    // build thumbnails for all listings
    if (props.isThumbnail) {
      return this._buildThumbnail(listing, props.expand, isNSFW, isPlayable, preview);
    }

    // this only applies to self posts
    if (props.editing && listing.selftext) {
      return this._renderEditText(listing.selftext);
    } else if (listing.selftext) {
      return this._renderTextHTML(listing.expandContent, !expanded, listing.id);
    }

    // this case catches any 'playable' gif or video and displays the preview image
    // so we don't get annoying auto play.
    if (isPlayable && preview && !this.state.playing) {
      return this.buildImage(preview, url, this._togglePlaying, isPlayable);
    }

    if (oembed) {
      return this._buildMedia(listing, url, oembed);
    }

    if (preview) {
      let cb = isNSFW ? props.toggleShowNSFW : null;
      return this.buildImage(preview, url, cb);
    }

    return this._renderPlaceholder(isNSFW);
  }

  buildImage(src, href, onClick, playable=false) {
    // this handles only direct links to gifs.
    let html5 = _gifToHTML5(href);
    if (this.state.playing && html5) {
      if (html5.iframe) {
        return this._renderIFrame(html5.iframe, _DEFAULT_ASPECT_RATIO);
      }

      return this._renderVideo({webm: html5.webm, mp4: html5.mp4}, html5.poster);
    }

    return this._renderImage(src, href, onClick, playable);
  }

  _renderTextPlaceholder(html, collapsed, id) {
    return (
      <div
        ref='text'
        key={ id }
        className={ 'ListingContent-text placeholder' + (collapsed ? ' collapsed' : '') }
        onClick={ this.props.expand }
      />
    );
  }

  _renderTextHTML(html, collapsed, id) {
    return (
      <div
        ref='text'
        key={ id }
        className={ 'ListingContent-text' + (collapsed ? ' collapsed' : '') }
        dangerouslySetInnerHTML={ {__html: html} }
        onClick={ _wrapSelftextExpand(this.props.expand) }
      />
    );
  }

  _renderImage(src, href, onClick, playable) {
    let props = this.props;

    let compact = this._isCompact();
    let isNSFW = ListingContent.isNSFW(props.listing);

    let style = {};

    const config = this.props.app.config;
    const https = (config.https || config.httpsProxy);

    let playIconNode;
    if (playable && !(isNSFW && !props.showNSFW)) {
      playIconNode = <span className='icon-play-circled'>{ ' ' }</span>;
    }

    if (src.url) {
      style.backgroundImage = 'url(' + forceProtocol(src.url, https) + ')';
    }

    let nsfwNode;
    if (isNSFW && !props.showNSFW) {
      nsfwNode = this._buildNSFW(props.compact);
    }

    let aspectRatio = this._getAspectRatio(props.single, src.width, src.height);

    if (props.single && aspectRatio) {
      style.height = 1 / aspectRatio * props.width + 'px';
    }

    if (!onClick && compact) {
      onClick = props.expand;
    }

    let noRoute = !!onClick;

    if (src && src.url && !aspectRatio) {
      return (
        <a className='ListingContent-image'
          href={ href }
          onClick={ onClick }
          data-no-route={ noRoute }
        >
          <img className='ListingContent-image-img' src={ src.url }/>
          { playIconNode }
          { nsfwNode }
        </a>
      );
    }

    let showPlaceholder = isNSFW && !props.showNSFW && !src.url;

    let linkClass = 'ListingContent-image ' + (props.isThumbnail ? '' :
      _aspectRatioClass(aspectRatio)) + (showPlaceholder ? ' placeholder' : '');

    return (
      <a
        className={ linkClass }
        href={ href }
        onClick={ onClick }
        data-no-route={ noRoute }
        style={ style }
      >
          { playIconNode }
          { nsfwNode }
      </a>
    );
  }

  _renderVideo(src, poster) {
    let sources = [];
    for (let i in src) {
      sources.push(<source type={ 'video/' + i } src={ src[i] } key={ 'video-src' + i } />);
    }

    let props = this.props;
    let aspectRatio = this._getAspectRatio(props.single, src.width, src.height) ||
                      _DEFAULT_ASPECT_RATIO;
    let style = {};
    if (props.single) {
      style.height = 1 / aspectRatio * props.width + 'px';
    }

    return (
      <div className={ 'ListingContent-video ' + _aspectRatioClass(aspectRatio) } style={ style }>
        <video
          className='ListingContent-videovideo'
          poster={ poster }
          width='100%'
          height='100%'
          loop='true'
          muted='true'
          controls='true'
          autoPlay='true'
        >
          { sources }
        </video>
      </div>
    );
  }

  _renderIFrame(src, aspectRatio) {
    let style = {};

    if (this.props.single && aspectRatio) {
      style.height = 1 / aspectRatio * this.props.width + 'px';
    }

    let className = 'ListingContent-iframe ' + (aspectRatio ?
      _aspectRatioClass(aspectRatio) : 'set-height');
    return (
      <div className={ className } style={ style }>
        <iframe
          className='ListingContent-iframeiframe'
          width='100%'
          height='100%'
          src={ src }
          frameBorder='0'
          allowFullScreen=''
          sandbox='allow-scripts allow-forms allow-same-origin'
        />
      </div>
    );
  }

  _renderHTML(content, aspectRatio) {
    return (
      <div
        className={ 'ListingContent-html ' + _aspectRatioClass(aspectRatio) }
        dangerouslySetInnerHTML={ {__html: content} }
      />
    );
  }

  _renderPlaceholder(isNSFW) {
    let props = this.props;
    let nsfwNode;
    if (isNSFW) {
      nsfwNode = this._buildNSFW(props.compact);
    }
    if (this._isCompact()) {
      return (
        <a
          className={ 'ListingContent-image' + (props.loaded ? ' placeholder' : '') }
          href={ mobilify(props.listing.url) }
        >{ nsfwNode }</a>
      );
    }
  }

  _renderEditText(text) {
    let props = this.props;
    let errorClass = 'visually-hidden';
    let errorText = '';

    if (props.editError) {
      let err = props.editError[0];
      errorClass = 'alert alert-danger alert-bar';
      errorText = err[0] + ': ' + err[1];
    }
    return (
      <div >
        <div className={ errorClass } role='alert'>
          { errorText }
        </div>
        <div className='ListingContent-textarea-holder'>
          <textarea
            className='form-control'
            defaultValue={ text }
            ref='updatedText'
          ></textarea>
        </div>
        <div className='btn-group btn-group-justified'>
          <div className='btn-group'>
            <button
              className='btn btn-primary btn-block'
              type='button'
              onClick={ this.props.toggleEdit }
            >Cancel</button>
          </div>
          <div className='btn-group'>
            <button
              className='btn btn-primary btn-block'
              type='button'
              onClick={ this.saveText }
            >Save</button>
          </div>
        </div>
      </div>
    );
  }

  saveText(e) {
    e.preventDefault();

    const val = this.refs.updatedText.value.trim();
    this.props.saveUpdatedText(val);
  }

  _buildNSFW(compact) {
    if (compact) {
      return (
        <div className='ListingContent-nsfw'>
          <p className='ListingContent-nsfw-p'>NSFW</p>
        </div>
      );
    }

    return (
      <div className='ListingContent-nsfw'>
        <p className='ListingContent-nsfw-p'>This post is marked as NSFW</p>
        <p className='ListingContent-nsfw-p outlined'>Show post?</p>
      </div>
    );
  }

  _buildMedia(listing, url, oembed) {
    let aspectRatio = this._getAspectRatio(this.props.single,
                        oembed.width, oembed.height) || _DEFAULT_ASPECT_RATIO;

    let media;
    switch (oembed.type) {
      case 'image':
        media = this._renderIFrame(url, aspectRatio);
        break;
      case 'video':
        media = this._renderHTML(listing.expandContent, aspectRatio);
        break;
      case 'rich':
        let findSrc = oembed.html.match(/src="([^"]*)/);
        let frameUrl;

        if (findSrc && findSrc[1]) {
          frameUrl = findSrc[1].replace('&amp;', '&');
        }

        if (frameUrl) {
          media = this._renderIFrame(frameUrl, aspectRatio);
        }
        break;
    }
    return media;
  }

  _buildThumbnail(listing, expand, isNSFW, playable, preview) {
    if (listing.promoted && has(listing, 'preview.images.0.resolutions.0')) {
      let url = listing.cleanUrl;
      return this._renderImage(preview, url, expand, playable);
    } else if (preview) {
      return this._renderImage(preview, listing.cleanUrl, expand, playable);
    } else if (listing.selftext) {
      return this._renderTextPlaceholder(listing.expandContent, true, listing.id);
    }

    return this._renderPlaceholder(isNSFW);
  }

  _previewImage(isNSFW, oembed, showNSFW) {
    let { listing, width, tallestHeight } = this.props;
    let compact = this._isCompact();

    width = compact ? 80 : width;

    let preview = listing.preview;

    if (preview) {
      preview = (preview.images || [])[0];

      if (!showNSFW && isNSFW) {
        // for logged out users and users who have the 'make safer for work'
        // option enabled there will be no nsfw variants returned.
        if (has(preview, 'variants.nsfw.resolutions')) {
          preview = preview.variants.nsfw;
        } else {
          return {};
        }
      }

      let resolutions = preview.resolutions;
      let source = preview.source;

      if (resolutions) {
        let bestFit = resolutions
          .sort((a, b) => {
            return a.width - b.width;
          })
          .find((r) => {
            if (compact) {
              return r.width >= width && r.height >= tallestHeight;
            }

            return r.width >= width;
          });

        if (bestFit) {
          return bestFit;
        }
      }

      if (source) {
        return source;
      }
    }

    if (oembed) {
      if (isNSFW && showNSFW ||!isNSFW) {
        return {
          url: oembed.thumbnail_url,
          width: oembed.thumbnail_width,
          height: oembed.thumbnail_height,
        };
      }

      return {};
    }
  }

  _isExpanded() {
    let { expanded, listing, single } = this.props;
    return (single && !ListingContent.isNSFW(listing)) ? true : expanded;
  }

  _isCompact() {
    let props = this.props;
    return props.compact && !props.expandedCompact;
  }

  _getAspectRatio(single, width, height) {
    if (width && height) {
      return single ? width / height : _limitAspectRatio(width / height);
    }
  }

  _togglePlaying(e) {
    e.preventDefault();
    this.setState({playing: !this.state.playing});
  }

  static isNSFW(listing) {
    if (!listing || !listing.title) {
      return;
    }

    return listing.title.match(/nsf[wl]/gi) || listing.over_18;
  }
}

export default ListingContent;
