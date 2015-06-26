import React from 'react';
import MyMath from '../../lib/danehansen/utils/MyMath';

import AutoTween from '../components/AutoTween';
import PlayIcon from '../components/icons/PlayIcon';

var _gifMatch = /\.(?:gif)/gi;
var _gfyRegex = /https?:\/\/(?:.+)\.gfycat.com\/(.+)\.gif/;
var _httpsRegex = /^https:\/\//;
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
function _aspectRatioClass(ratio) {
  if (!ratio) {
    return  'aspect-ratio-' + 16 + 'x' + 9;
  }
  var w = MyMath.round(ratio * _HEIGHT, _INCREMENT);
  var euclid = MyMath.euclid(w, _HEIGHT);
  return  'aspect-ratio-' + w / euclid + 'x' + _HEIGHT / euclid;
}

class ListingContent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  componentWillUpdate(nextProps, nextState) {
    var last = this._isExpanded();
    var next = nextProps.expanded || nextProps.single;
    if (last !== next) {
      var ref = this.refs.text;
      if (ref) {
        //105 corresponds with a css value in ListingContent.less
        AutoTween.maxHeight(ref.getDOMNode(), next ? 'none' : 105, false);
      }
    }
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
    if (!listing) {
      return null;
    }
    var expanded = this._isExpanded();
    var media = listing.media;
    var url = listing.url;

    var oembed = media ? media.oembed : null;
    var permalink = props.listing.promoted ? url : listing.cleanPermalink;

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
          return this.buildImage(preview || thumbnailUrl, permalink);
        }
      } else if (type === 'video') {
        if (expanded) {
          return this._renderHTML(listing.expandContent);
        } else {
          return this.buildImage(preview || thumbnailUrl, permalink, props.expand);
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
      } else if (url.match(ListingContent.imgMatch)) {
        if (expanded && _httpsRegex.test(url)) {
          return this.buildImage(url, url);
        } else {
          return this.buildImage(preview, permalink, (url.match(_gifMatch) && !expanded) ? props.expand : null);
        }
      } else if (props.editing && listing.selftext) {
        return this._renderEditText(listing.selftext);
      } else if (listing.selftext && !props.compact) {
        return this._renderTextHTML(listing.expandContent, !expanded, listing.id);
      } else if (listing.domain.indexOf('self.') === 0) {
        return this._renderPlaceholder();
      } else if (preview) {
        return this.buildImage(preview, permalink);
      }

    return this._renderPlaceholder();
  }

  //TODO: this method should be integrated into buildContent but it hurts my brain to figure out how to do so
  buildImage(src, href, onClick) {
    var props = this.props;
    var html5 = _gifToHTML5(src, {
      https: props.https,
      httpsProxy: props.httpsProxy,
    });
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

  _renderTextHTML(html, collapsed, id) {
    return (
      <div  ref='text' key={id} className={ 'ListingContent-text' + (collapsed ? ' collapsed' : '') }
            dangerouslySetInnerHTML={ {__html: html} }
            onClick={ this.props.expand }/>
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
        var playIconNode = <PlayIcon/>;
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
      <a  className={'ListingContent-image ' + _aspectRatioClass(aspectRatio) + (!src && loaded ? ' placeholder' : '')}
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
        <a className={'ListingContent-image' + (props.loaded ? ' placeholder' : '')} href={ props.listing.cleanPermalink }/>
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
        <textarea
          className='form-control'
          defaultValue={text}
          ref='updatedText'
        ></textarea>
        <div className=''>
          <button
            className='btn btn-primary btn-block'
            type='button'
            onClick={ this.props.toggleEdit }
          >Cancel</button>
          <button
            className='btn btn-primary btn-block'
            type='button'
            onClick={ this.saveText.bind(this) }
          >Save</button>
        </div>
      </div>
    );
  }

  saveText(e) {
    e.preventDefault();

    var val = this.refs.updatedText.getDOMNode().value
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


    if (imgMatch && expanded) {
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
    var props = this.props;
    var listing = props.listing;

    try {
      var oembed = listing.media.oembed;
      var ratio = oembed.width / oembed.height;
      return props.single ? ratio : _limitAspectRatio(ratio);
    } catch (err) {
    }

    try {
      var source = listing.preview.images[0].source;
      ratio = source.width / source.height;
      return props.single ? ratio : _limitAspectRatio(ratio);
    } catch (err) {
    }
    // TODO: this doesn't work
    // if (props.app.config.debug) {
      // console.log('ListingContent._aspectRatio: missed a case', listing);
    // }
  }
}

ListingContent.imgMatch = /\.(?:gif|jpe?g|png)/gi;

ListingContent.isNSFW = function(listing) {
  if (!listing) {
    return;
  }
  return listing.title.match(/nsf[wl]/gi) || listing.over_18;
}

export default ListingContent;
