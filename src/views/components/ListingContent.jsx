import React from 'react';
import has from 'lodash/object/has';
import URL from 'url';

import mobilify from '../../lib/mobilify';
import gifToHTML5Sources from '../../lib/gifToHTML5Sources';
import { posterForHrefIfGiphyCat } from '../../lib/gifToHTML5Sources';
import propTypes from '../../propTypes';
import BaseComponent from './BaseComponent';

const PropTypes = React.PropTypes;
const _DEFAULT_ASPECT_RATIO = 16 / 9;

function autoPlayGif(gif) {
  if (!gif) {
    return;
  }

  // need this to make iOS really autoplay the gif
  gif.play();
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
  const media = listing.media;
  if (listing.url && listing.url.indexOf('.gif') > -1 ||
      (media && media.oembed && media.oembed.type !== 'image')
     ) {
    return true;
  }

  return false;
}

function forceProtocol(url, https) {
  const urlObj = URL.parse(url);
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
        <div ref='all' className={ `ListingContent${(this._isCompact() ? ' compact' : '')}` }>
          { stalactiteNode }
          { contentNode }
        </div>
      );

    }

    return null;
  }

  useOurOwnPlayingOrPreviewing(oembed, url) {
    if (!this.state.playing || !oembed) {
      return true;
    }

    const provider = oembed.provider_name.toLowerCase();
    return (provider === 'gfycat' || provider === 'imgur' || /\.gif$/.test(url));
  }

  buildContent() {
    const props = this.props;
    const listing = props.listing;

    const expanded = this._isExpanded();
    const isNSFW = ListingContent.isNSFW(listing);
    const isPlayable = _isPlayable(listing);

    const oembed = listing.media ? listing.media.oembed : null;
    const url = mobilify(listing.url || listing.cleanPermalink);

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
    // if it's not playing, or the video that autoplays if it is playing
    if (isPlayable && preview && this.useOurOwnPlayingOrPreviewing(oembed, url)) {
      return this.buildImage(preview, url, this._togglePlaying, isPlayable);
    }

    if (oembed) {
      return this._buildMedia(listing, url, oembed);
    }

    if (preview) {
      const cb = isNSFW ? props.toggleShowNSFW : null;
      return this.buildImage(preview, url, cb);
    }

    return this._renderPlaceholder(isNSFW);
  }

  buildImage(src, href, onClick, playable=false) {
    // this handles only direct links to gifs.
    const html5sources = gifToHTML5Sources(href);
    if (this.state.playing && html5sources) {
      if (html5sources.iframe) {
        return this._renderIFrame(html5sources.iframe, _DEFAULT_ASPECT_RATIO);
      }

      const generatedSrc = {
        webm: html5sources.webm,
        mp4: html5sources.mp4,
        width: src.width,
        height: src.height,
      };

      return this._renderVideo(generatedSrc, html5sources.poster);
    }

    return this._renderImage(src, href, onClick, playable);
  }

  _renderTextPlaceholder(html, collapsed, id) {
    return (
      <div
        ref='text'
        key={ id }
        className={ `ListingContent-text placeholder${(collapsed ? ' collapsed' : '')}` }
        onClick={ this.props.expand }
      />
    );
  }

  _renderTextHTML(html, collapsed, id) {
    return (
      <div
        ref='text'
        key={ id }
        className={ `ListingContent-text${(collapsed ? ' collapsed' : '')}` }
        dangerouslySetInnerHTML={ {__html: html} }
        onClick={ _wrapSelftextExpand(this.props.expand) }
      />
    );
  }

  _renderImage(src, href, onClick, playable) {
    const props = this.props;

    const compact = this._isCompact();
    const isNSFW = ListingContent.isNSFW(props.listing);

    const style = {};

    const config = this.props.app.config;
    const https = (config.https || config.httpsProxy);

    let playIconNode;
    if (playable && !(isNSFW && !props.showNSFW)) {
      playIconNode = <span className='icon-play-circled'>{ ' ' }</span>;
    }

    if (src.url) {
      const giphyPosterHref = posterForHrefIfGiphyCat(href);
      const backgroundImage = giphyPosterHref ? giphyPosterHref : src.url;
      style.backgroundImage = `url("${forceProtocol(backgroundImage, https)}")`;
    }

    let nsfwNode;
    if (isNSFW && !props.showNSFW) {
      nsfwNode = this._buildNSFW(props.compact);
    }

    const aspectRatio = this._getAspectRatio(props.single, src.width, src.height);

    if (props.single && aspectRatio) {
      const width = 1 / aspectRatio * props.width;
      style.height = `${width}px`;
    }

    if (!onClick && compact) {
      onClick = props.expand;
    }

    const noRoute = !!onClick;

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

    const showPlaceholder = isNSFW && !props.showNSFW && !src.url;

    let linkClass = 'ListingContent-image ';

    if (!props.isThumbnail) {
      linkClass += _aspectRatioClass(aspectRatio);

      if (showPlaceholder) {
        linkClass += ' placeholder';
      }
    }

    return (
      <a
        className={ linkClass }
        href={ href }
        onClick={ onClick }
        data-no-route={ noRoute }
        style={ style }
      >
          { this.state.playing ? <img className='ListingContent-inline-gif' src={ href } /> : null }
          { playIconNode }
          { nsfwNode }
      </a>
    );
  }

  _renderVideo(src, poster) {
    const sources = [];
    let i;
    for (i in src) {
      if (i === 'width' || i === 'height' || !src[i]) {
        continue;
      }

      sources.push(<source type={ `video/${i}` } src={ src[i] } key={ `video-src-${i}` } />);
    }

    const props = this.props;

    const aspectRatio = this._getAspectRatio(props.single, src.width, src.height) ||
                      _DEFAULT_ASPECT_RATIO;

    const style = {};
    if (props.single) {
      const height = 1 / aspectRatio * props.width;
      style.height = `${height}px`;
    }

    return (
      <div className={ `ListingContent-video ${_aspectRatioClass(aspectRatio)}` } style={ style }>
        <video
          className='ListingContent-videovideo'
          poster={ poster }
          width='100%'
          height='100%'
          loop='true'
          muted='true'
          controls='true'
          autoPlay='true'
          ref={ autoPlayGif }
        >
          { sources }
        </video>
      </div>
    );
  }

  _renderIFrame(src, aspectRatio) {
    const style = {};

    if (this.props.single && aspectRatio) {
      const height = 1 / aspectRatio * this.props.width;
      style.height = `${height}px`;
    }

    const aspectRatioClass = (aspectRatio ? _aspectRatioClass(aspectRatio) : 'set-height');
    const className = `ListingContent-iframe ${aspectRatioClass}`;

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
        className={ `ListingContent-html ${_aspectRatioClass(aspectRatio)}` }
        dangerouslySetInnerHTML={ {__html: content} }
      />
    );
  }

  _renderPlaceholder(isNSFW) {
    const props = this.props;
    let nsfwNode;

    if (isNSFW) {
      nsfwNode = this._buildNSFW(props.compact);
    }

    if (this._isCompact()) {
      return (
        <a
          className={ `ListingContent-image${(props.loaded ? ' placeholder' : '')}` }
          href={ mobilify(props.listing.url) }
        >{ nsfwNode }</a>
      );
    }
  }

  _renderEditText(text) {
    const props = this.props;
    let errorClass = 'visually-hidden';
    let errorText = '';

    if (props.editError) {
      const err = props.editError[0];
      errorClass = 'alert alert-danger alert-bar';
      errorText = `${err[0]}: ${err[1]}`;
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
    const aspectRatio = this._getAspectRatio(this.props.single,
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
        const findSrc = oembed.html.match(/src="([^"]*)/);
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
      const url = listing.cleanUrl;
      return this._renderImage(preview, url, expand, playable);
    } else if (preview) {
      return this._renderImage(preview, listing.cleanUrl, expand, playable);
    } else if (listing.selftext) {
      return this._renderTextPlaceholder(listing.expandContent, true, listing.id);
    }

    return this._renderPlaceholder(isNSFW);
  }

  _previewImage(isNSFW, oembed, showNSFW) {
    const { listing, width, tallestHeight } = this.props;
    const compact = this._isCompact();

    const imageWidth = compact ? 80 : width;

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

      const resolutions = preview.resolutions;
      const source = preview.source;

      if (resolutions) {
        const bestFit = resolutions
          .sort((a, b) => {
            return a.width - b.width;
          })
          .find((r) => {
            if (compact) {
              return r.width >= imageWidth && r.height >= tallestHeight;
            }

            return r.width >= imageWidth;
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
    const { expanded, listing, single } = this.props;
    return (single && !ListingContent.isNSFW(listing)) ? true : expanded;
  }

  _isCompact() {
    const props = this.props;
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
