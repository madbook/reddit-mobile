import React from 'react';
import MyMath from '../../lib/danehansen/utils/MyMath';

import AutoTween from '../components/AutoTween';
import PlayIcon from '../components/icons/PlayIcon';

var _gifMatch = /\.(?:gif)/gi;
var _gfyRegex = /https?:\/\/(?:.+)\.gfycat.com\/(.+)\.gif/;
var _httpsRegex = /^https:\/\//;

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
      var compact = ListingContent.isCompact(this.props);
      if (!compact && !this.props.expandedCompact) {
        var stalactiteNode = <div className='stalactite'/>;
      }
      return (
        <div ref='all' className={ 'ListingContent' + (compact ? ' compact' : '')}>
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

    var preview = this._previewImageUrl(expanded);

    if (media && oembed) {
      if (this.state.expanded || !ListingContent.isNSFW(listing)) {
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
          return this.buildImage(preview || thumbnailUrl, permalink, this.props.expand);
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
            return this.buildImage(preview || thumbnailUrl, url, this.props.expand);
          }
        }
      } else if (url.match(ListingContent.imgMatch)) {
        if (expanded && _httpsRegex.test(url)) {
          return this.buildImage(url, url);
        } else {
          return this.buildImage(preview, permalink, (url.match(_gifMatch) && !expanded) ? this.props.expand : null);
        }
      } else if (listing.selftext && !props.compact) {
        return this._renderTextHTML(listing.expandContent, !expanded);
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
          return this._renderIFrame(html5.iframe, this._aspectRatio());
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

  _renderTextHTML(html, collapsed) {
    return (
      <div  ref='text' className={ 'ListingContent-text' + (collapsed ? ' collapsed' : '') }
            dangerouslySetInnerHTML={ {__html: html} }
            onClick={ this.props.expand }/>
    );
  }

  _renderImage(src, href, onClick) {
    var props = this.props;
    var compact = ListingContent.isCompact(props);
    var style = {};
    var nsfw = ListingContent.isNSFW(props.listing);
    var expanded = this._isExpanded();
    var loaded = props.loaded;
    if (loaded) {
      if (onClick) {
        var playIconNode = <PlayIcon/>;
      }
      if (nsfw && !this.state.expanded) {
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
        style.backgroundImage = 'url(' + src + ')';
      }
    }
    var aspectRatio = this._aspectRatio();
    if (props.single) {
      style.height = 1 / aspectRatio * props.width  + 'px';
    }

    onClick = nsfw && !this.state.expanded ? this._expand : onClick;
    var noRoute = !!onClick && !compact;

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
    var aspectRatio = this._aspectRatio();
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
    var aspectRatio = this._aspectRatio();
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
    if (ListingContent.isCompact(props)) {
      return (
        <a className={'ListingContent-image' + (props.loaded ? ' placeholder' : '')} href={ props.listing.cleanPermalink }/>
      );
    }
  }

  _previewImageUrl(expanded) {
    var props = this.props;
    var listing = props.listing;
    var compact = ListingContent.isCompact(props);

    var url = listing.url;
    var width = compact ? 80 : props.width;

    var imgMatch = url.match(ListingContent.imgMatch);
    var isNSFW = ListingContent.isNSFW(listing);

    if (imgMatch) {
      // If single or expanded and not nsfw, return image
      if (expanded && !isNSFW) {
        return url;
      // If purposefully expanded and nsfw, return image
      } else if (this.state.expanded && isNSFW) {
        return url;
      }
    }

    var nsfw = ListingContent.isNSFW(listing);
    var preview = listing.preview;

    if (preview) {
      var images = preview.images;
      if (images) {
        preview = images[0];
      }
      if (!this.state.expanded && nsfw && preview.variants && preview.variants.nsfw && preview.variants.nsfw.resolutions) {
        preview = preview.variants.nsfw;
      }

      var resolutions = preview.resolutions;

      var source = preview.source;
      if (preview && resolutions) {
        var previewImage = resolutions
                        .concat([ source ])
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
      } else if (source) {
         return source.url;
      }

      if (previewImage) {
        return previewImage.url;
      } else {
        return source.url;
      }
    } else if (!expanded && nsfw) {
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
    return props.expanded || props.single;
  }

  _aspectRatio() {
    var props = this.props;
    var listing = props.listing;

    var media = listing.media;
    if (media) {
      var oembed = media.oembed;
      if (oembed) {
        var ratio = oembed.width / oembed.height;
        return props.single ? ratio : _limitAspectRatio(ratio);
      }
    }

    var preview = listing.preview;
    if (preview) {
      var images = preview.images;
      if (images) {
        var image = images[0];
        if (image) {
          var source = image.source;
          if (source) {
            ratio = source.width / source.height;
            return props.single ? ratio : _limitAspectRatio(ratio);
          }
        }
      }
    }

    //TODO: this doesn't work
    /*if (props.app.config.debug) {
      console.log('ListingContent._aspectRatio: missed a case', listing);
    }*/
    return 16 / 9;
  }
}

ListingContent.imgMatch = /\.(?:gif|jpe?g|png)/gi;

ListingContent.isNSFW = function(listing) {
  if (!listing) {
    return;
  }
  return listing.title.match(/nsf[wl]/gi) || listing.over_18;
}

ListingContent.isCompact = function(props) {
  return props.compact && !props.single && !props.expandedCompact;
}

export default ListingContent;
