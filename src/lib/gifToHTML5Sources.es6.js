import rootDomain from './rootDomain';

const _gfyCatRegex = /^https?:\/\/(.*\.?)gfycat.com/;
const _gfycatMobileBase = 'https://thumbs.gfycat.com';
const _gfycatWebmBase = 'https://zippy.gfycat.com';
const _GIF_EXTENSION = /\.gif$/;

function gfycatMP4Url(gfyCatUrl) {
  // gif doesn't seem to be there, so the .gif replace is a safety check
  return `${gfyCatUrl.replace(_gfyCatRegex, _gfycatMobileBase)
                     .replace(_GIF_EXTENSION, '')}-mobile.mp4`;
}

function gfyCatWebmURL(gfyCatUrl) {
  // gif doesn't seem to be there, so the .gif replace is a safety check
  return `${gfyCatUrl.replace(_gfyCatRegex, _gfycatWebmBase)
                     .replace(_GIF_EXTENSION, '')}.webm`;
}

function gfycatPosterUrl(gfyCatUrl) {
  // gif doesn't seem to be there, so the .gif replace is a safety check
  return `${gfyCatUrl.replace(_gfyCatRegex, _gfycatMobileBase)
                     .replace(_GIF_EXTENSION, '')}-mobile.jpg`;
}

function posterForHrefIfGiphyCat(url) {
  const urlRoot = rootDomain(url);
  if (urlRoot === 'gfycat.com') {
    return gfycatPosterUrl(url);
  }
}

export { posterForHrefIfGiphyCat };

export default function gifToHTML5Sources(url) {
  const urlRoot = rootDomain(url);
  if (!urlRoot) {
    return;
  }

  if (urlRoot === 'gfycat.com') {
    return {
      mp4: gfycatMP4Url(url),
      webm: gfyCatWebmURL(url),
      poster: gfycatPosterUrl(url),
    };
  }

  if (!_GIF_EXTENSION.test(url)) { return; }

  if (urlRoot === 'giphy.com') {
    return {
      mp4: url.replace(_GIF_EXTENSION, '.mp4'),
    };
  }

  // If it's imgur, make a gifv link
  if (urlRoot === 'imgur.com') {
    return {
      webm: url.replace(_GIF_EXTENSION, '.webm'),
      mp4: url.replace(_GIF_EXTENSION, '.mp4'),
      poster: url.replace(_GIF_EXTENSION, 'h.jpg'),
    };
  }
}
