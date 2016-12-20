import rootDomain from './rootDomain';

const _gfyCatRegex = /^https?:\/\/(.*\.?)gfycat.com/;
const _gfycatMobileBase = 'https://thumbs.gfycat.com';
const _gfycatWebmBase = 'https://zippy.gfycat.com';
const _GIF_EXTENSION = /\.gif$/;
const _GIF_V_EXTENSION = /\.gifv$/;

// Checks for an ending like '.gif?fm=mp4' or '.gif?foo=bar&fm=mp4'
const _redditMp4Ending = /\.gif\?(.*&)*fm=mp4(&|$)/;

const _IMGUR_GALLERY_PATH = /\/gallery\//;

const _IMGUR_GIFV_QUERY_PARAMS = /\.gif\?.*$/;

function urlToHTTPS(url) {
  return url.replace(/^http:\/\//, 'https://');
}

function gfycatUrlHelper(gfyCatUrl, baseUrl, extension) {
  // Preserve arguments sent after the hash mark
  const [url, afterHash] = gfyCatUrl.split('#');
  const hashArgs = (afterHash !== undefined) ? `#${afterHash}` : '';

  // gif doesn't seem to be there, so the .gif replace is a safety check
  return `${url.replace(_gfyCatRegex, baseUrl)
               .replace(_GIF_EXTENSION, '')}${extension}${hashArgs}`;
}

function gfycatMP4Url(gfyCatUrl) {
  return gfycatUrlHelper(gfyCatUrl, _gfycatMobileBase, '-mobile.mp4');
}

function gfyCatWebMUrl(gfyCatUrl) {
  return gfycatUrlHelper(gfyCatUrl, _gfycatWebmBase, '.webm');
}

function gfycatPosterUrl(gfyCatUrl) {
  return gfycatUrlHelper(gfyCatUrl, _gfycatMobileBase, '-mobile.jpg');
}

function posterForHrefIfGiphyCat(url) {
  const urlRoot = rootDomain(url);
  if (urlRoot === 'gfycat.com') {
    return gfycatPosterUrl(url);
  }
}

export { posterForHrefIfGiphyCat };

export default function gifToHTML5Sources(url, previewUrl) {
  const urlRoot = rootDomain(url);
  if (!urlRoot) {
    return;
  }

  if (urlRoot === 'gfycat.com') {
    return {
      mp4: gfycatMP4Url(url),
      webm: gfyCatWebMUrl(url),
      poster: gfycatPosterUrl(url),
    };
  }

  if (urlRoot === 'redditmedia.com' && _redditMp4Ending.test(url)) {
    // convert to https (if using http)
    const redditUrl = urlToHTTPS(url);
    return {
      mp4: redditUrl,
      poster: previewUrl,
    };
  }

  if (urlRoot === 'giphy.com' && _GIF_EXTENSION.test(url)) {
    // convert to https (if using http)
    const giphyURL = urlToHTTPS(url);
    return {
      mp4: giphyURL.replace(_GIF_EXTENSION, '.mp4'),
      poster: giphyURL.replace(_GIF_EXTENSION, '_s.gif'),
    };
  }

  // If it's imgur, make a gifv link
  if (urlRoot === 'imgur.com') {
    // convert to https (if using http)
    let imgurURL = urlToHTTPS(url);

    // strip query params
    imgurURL = imgurURL.replace(_IMGUR_GIFV_QUERY_PARAMS, '.gifv');

    // Sometimes we get imgur urls that have /gallery/ in them
    // when they should really point to just the gif. Sometimes they have the
    // wrong extension and maybe include query params. Clean that all up
    if (_IMGUR_GALLERY_PATH.test(imgurURL) || /\.jpg(\?.*$)$/.test(imgurURL)) {
      imgurURL = imgurURL.replace(_IMGUR_GALLERY_PATH, '/').replace(/\.(jpg|gif|gifv)(\?.*$)?/, '');
      imgurURL = `${imgurURL}.gifv`;
    }

    if (_GIF_V_EXTENSION.test(imgurURL)) {
      return {
        webm: imgurURL.replace(_GIF_V_EXTENSION, '.webm'),
        mp4: imgurURL.replace(_GIF_V_EXTENSION, '.mp4'),
        poster: imgurURL.replace(_GIF_V_EXTENSION, 'h.jpg'),
      };
    }
  }
}
