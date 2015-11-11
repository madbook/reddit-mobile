import React from 'react';

import mobilify from '../../lib/mobilify';
import propTypes from '../../propTypes';

const PropTypes = React.PropTypes;

import BaseComponent from './BaseComponent';

const _gifMatch = /\.(?:gif)/gi;
const _gfyRegex = /https?:\/\/(?:.+)\.gfycat.com\/(.+)\.gif/;
const _httpsRegex = /^https:\/\//;
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
      var id = gfy[1];
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
  if(b == 0) {
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
    return  'aspect-ratio-16x9';
  }

  var w = incrRound(ratio * _HEIGHT, _INCREMENT);
  var lcd = euclid(w, _HEIGHT);

  return `aspect-ratio-${(w / lcd)}x${(_HEIGHT / lcd)}`;
}

// Allow links to pass through in selftext
function _wrapSelftextExpand(fn) {
  return function(e) {
    if (e.target.tagName !== 'A') {
      fn(e);
    }
  }
}

class ListingContent extends BaseComponent {
  constructor(props) {
    super(props);
  }

  render() {
    var contentNode = this.buildContent();
    if (contentNode) {
      var props = this.props;
      if (!props.compact && !props.expandedCompact) {
        var stalactiteNode = <div className='stalactite'/>;
      }
      return (
        <div ref='all' className={ 'ListingContent' + (this._isCompact() ? ' compact' : '')}>
          { stalactiteNode }
          { contentNode }
        </div>
      );
    } else {
      return null;
    }
  }

  buildContent() {
    var props = this.props;
    var listing = props.listing;
    var expanded = this._isExpanded();
    var media = listing.media;

    var oembed = media ? media.oembed : null;
    var url = mobilify(listing.url || listing.cleanPermalink);

    var preview = this._previewImageUrl();

    if (media && oembed) {
      if (expanded || !ListingContent.isNSFW(listing)) {
        var thumbnailUrl = oembed.thumbnail_url;
      }
      var type = oembed.type;
      if (type === 'image') {
        if (expanded) {
          return this._renderIFrame(url);
        } else {
          return this.buildImage(preview || thumbnailUrl, url);
        }
      } else if (type === 'video') {
        if (expanded) {
          return this._renderHTML(listing.expandContent);
        } else {
          return this.buildImage(preview || thumbnailUrl, url, props.expand);
        }
      } else if (type === 'rich') {
          var findSrc = oembed.html.match(/src="([^"]*)/);
          var frameUrl;

          if (findSrc && findSrc[1]) {
            frameUrl = findSrc[1].replace('&amp;', '&');
          }

          if (expanded && frameUrl) {
            return (
              this._renderIFrame(
                frameUrl,
                oembed.height / oembed.width
              )
            );
          } else {
            return this.buildImage(preview || thumbnailUrl, url, props.expand);
          }
        }
      } else if (url.match(ListingContent.imgMatch) && !listing.promoted) {
        if (expanded && _httpsRegex.test(url)) {
          return this.buildImage(url, url);
        } else {
          return this.buildImage(preview, url, (url.match(_gifMatch) && !expanded) ? props.expand : null);
        }
      } else if (props.editing && listing.selftext) {
        return this._renderEditText(listing.selftext);
      } else if (listing.selftext) {
        if (props.isThumbnail) {
          return this._renderTextPlaceholder(listing.expandContent, !expanded, listing.id);
        } else {
          return this._renderTextHTML(listing.expandContent, !expanded, listing.id);
        }
      } else if (listing.domain.indexOf('self.') === 0) {
        return this._renderPlaceholder();
      } else if (preview) {
        return this.buildImage(preview, url);
      }

    return this._renderPlaceholder();
  }

  //TODO: this method should be integrated into buildContent but it hurts my brain to figure out how to do so
  buildImage(src, href, onClick) {
    var props = this.props;
    var html5 = _gifToHTML5(src);
    var expanded = this._isExpanded();

    if (expanded) {
      if (html5) {
        if (html5.iframe) {
          return this._renderIFrame(html5.iframe, this._aspectRatio() || _DEFAULT_ASPECT_RATIO);
        } else {
          return this._renderVideo({webm: html5.webm, mp4: html5.mp4}, html5.poster);
        }
      }
    }

    if (html5 && html5.poster) {
      return this._renderImage(html5.poster, href, onClick);
    }

    return this._renderImage(src, href, onClick);
  }

  _renderTextPlaceholder(html, collapsed, id) {
    return (
      <div  ref='text' key={id} className={ 'ListingContent-text placeholder' + (collapsed ? ' collapsed' : '') }
            onClick={ this.props.expand }>
      </div>
    );
  }

  _renderTextHTML(html, collapsed, id) {
    return (
      <div  ref='text' key={id} className={ 'ListingContent-text' + (collapsed ? ' collapsed' : '') }
            dangerouslySetInnerHTML={ {__html: html} }
            onClick={ _wrapSelftextExpand(this.props.expand) }/>
    );
  }

  _renderImage(src, href, onClick) {
    var props = this.props;
    var compact = this._isCompact();
    var style = {};
    var isNSFW = ListingContent.isNSFW(props.listing);
    var expanded = this._isExpanded();
    var loaded = props.loaded;
    if (loaded) {
      if (onClick) {
        var playIconNode = <span className='icon-play-circled'>{' '}</span>;
      }
      if (isNSFW && !expanded) {
        if (compact) {
          var nsfwNode = (
            <div className='ListingContent-nsfw'>
              <p className='ListingContent-nsfw-p'>NSFW</p>
            </div>
          );
        } else {
          nsfwNode = (
            <div className='ListingContent-nsfw'>
              <p className='ListingContent-nsfw-p'>This post is marked as NSFW</p>
              <p className='ListingContent-nsfw-p outlined'>Show post?</p>
            </div>
          );
        }
      }
      if (src) {
        var a = document.createElement('a');
        a.href = src;
        a.protocol = location.protocol;

        style.backgroundImage = 'url(' + a.href + ')';
      }
    }
    var aspectRatio = this._aspectRatio();
    if (props.single && aspectRatio) {
      style.height = 1 / aspectRatio * props.width  + 'px';
    }
    onClick = (isNSFW && !expanded) ? props.expand : onClick;
    if (!onClick && compact) {
      onClick = props.expand;
    }
    var noRoute = !!onClick;

    if (src && !aspectRatio) {
      return (
        <a  className='ListingContent-image'
          href={ href }
          onClick={ onClick }
          data-no-route={ noRoute }>
          <img className='ListingContent-image-img' src={ src }/>
          { playIconNode }
          { nsfwNode }
        </a>
      );
    }

    return (
      <a  className={'ListingContent-image ' + (props.isThumbnail ? '' : _aspectRatioClass(aspectRatio)) + (!src && loaded ? ' placeholder' : '')}
          href={ href }
          onClick={ onClick }
          data-no-route={ noRoute }
          style={ style }>
          { playIconNode }
          { nsfwNode }
      </a>
    );
  }

  _renderVideo(src, poster) {
    var sources = [];
    for (var i in src) {
      sources.push(<source type={ 'video/' + i } src={ src[i] } key={ 'video-src' + i } />);
    }
    var props = this.props;
    var aspectRatio = this._aspectRatio() || _DEFAULT_ASPECT_RATIO;
    var style = {};
    if (props.single) {
      style.height = 1 / aspectRatio * props.width  + 'px';
    }
    return (
      <div className={'ListingContent-video ' + _aspectRatioClass(aspectRatio)} style={ style }>
        <video  className='ListingContent-videovideo'
                poster={ poster }
                width='100%'
                height='100%'
                loop='true'
                muted='true'
                controls='true'
                autoPlay='true'>
          { sources }
        </video>
      </div>
    );
  }

  _renderIFrame(src, aspectRatio) {
    var style = {};

    if (this.props.single && aspectRatio) {
      style.height = 1 / aspectRatio * this.props.width + 'px';
    }

    var className = 'ListingContent-iframe ' + (aspectRatio ? _aspectRatioClass(aspectRatio) : 'set-height');
    return (
      <div  className={ className } style={ style }>
        <iframe className='ListingContent-iframeiframe'
                width='100%'
                height='100%'
                src={ src }
                frameBorder='0'
                allowFullScreen=''
                sandbox='allow-scripts allow-forms allow-same-origin' />
      </div>
    );
  }

  _renderHTML(html) {
    var props = this.props;
    var aspectRatio = this._aspectRatio() || _DEFAULT_ASPECT_RATIO;
    if (props.single) {
      var style = {height: 1 / aspectRatio * props.width + 'px'};
    }
    return (
      <div  className={'ListingContent-html ' + _aspectRatioClass(aspectRatio)}
            dangerouslySetInnerHTML={ {__html: html} }
            style={ style }/>
    );
  }

  _renderPlaceholder() {
    var props = this.props;
    if (this._isCompact()) {
      return (
        <a className={'ListingContent-image' + (props.loaded ? ' placeholder' : '')} href={ mobilify(props.listing.url) }/>
      );
    }
  }

  _renderEditText(text) {
    var props = this.props;
    var errorClass = 'visually-hidden';
    var errorText = '';

    if (props.editError) {
      var err = props.editError[0];
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
            defaultValue={text}
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
              onClick={ this.saveText.bind(this) }
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

  _previewImageUrl() {
    var props = this.props;
    var listing = props.listing;
    var compact = this._isCompact();

    var url = listing.url;
    var width = compact ? 80 : props.width;

    var imgMatch = url.match(ListingContent.imgMatch);
    var isNSFW = ListingContent.isNSFW(listing);
    var expanded = this._isExpanded();


    if (imgMatch && expanded && !listing.promoted) {
      return url;
    }


    var preview = listing.preview;

    if (preview) {
      var images = preview.images;
      if (images) {
        preview = images[0];
      }

      if (!expanded && isNSFW) {
        try {
          if (preview.variants.nsfw.resolutions) {
            preview = preview.variants.nsfw;
          }
        } catch (err) {
        }
      }

      var resolutions = preview.resolutions;
      var source = preview.source;

      if (resolutions) {
        var bestFit = resolutions
          .sort((a, b) => {
            return a.width - b.width;
          })
          .find((r) => {
            if (compact) {
              return r.width >= width && r.height >= props.tallestHeight;
            } else {
              return r.width >= width;
            }
          });

        if (bestFit) {
          return bestFit.url;
        }
      }

      if (source) {
         return source.url;
      }
    } else if (!expanded && isNSFW) {
      return null;
    }

    var thumbnail = listing.thumbnail;
    if (compact && thumbnail && thumbnail.indexOf('http') === 0) {
      return thumbnail;
    }

    var media = listing.media;
    if (media && media.oembed) {
      return media.oembed.thumbnail_url;
    }
  }

  _isExpanded() {
    var props = this.props;
    return (props.single && !ListingContent.isNSFW(props.listing)) ? true : props.expanded;
  }

  _isCompact() {
    var props = this.props;
    return props.compact && !props.expandedCompact;
  }

  _aspectRatio() {
    let { listing, single } = this.props;

    if (listing.media && listing.media.oembed) {
      let oembed = listing.media.oembed;
      let ratio = oembed.width / oembed.height;
      return single ? ratio : _limitAspectRatio(ratio);
    } else if (listing.preview && (listing.preview.images || []).length) {
      let images = listing.preview.images;
      // we use the second item in resolutions if it exists because for ads
      // the first item is a thumbnail with 1x1 aspect ratio.
      let source = images[0].source || 
        (images[0].resolutions[1] || images[0].resolutions[0]);
      let ratio = source.width / source.height;
      return single ? ratio : _limitAspectRatio(ratio);
    } else {
      return false;
    }

  }

  static isNSFW(listing) {
    if (!listing || !listing.title) {
      return;
    }

    return listing.title.match(/nsf[wl]/gi) || listing.over_18;
  }

  static imgMatch = /\.(?:gif|jpe?g|png)/gi

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
  }
}

export default ListingContent;
