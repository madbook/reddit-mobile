import { POST_COMPACT_THUMBNAIL_WIDTH } from '../../constants';
import has from 'lodash/has';
import isEmpty from 'lodash/isEmpty';

export const DEFAULT_ASPECT_RATIO = 16 / 9;

//there are css values in aspect-ratio.less that must correlate with _WIDEST and _TALLEST
export const _WIDEST = 3;
export const _TALLEST = 1 / 3;

export function limitAspectRatio(aspectRatio) {
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

export function aspectRatioClass(ratio) {
  if (!ratio) {
    return 'aspect-ratio-16x9';
  }

  const w = incrRound(ratio * _HEIGHT, _INCREMENT);
  const lcd = euclid(w, _HEIGHT);

  return `aspect-ratio-${(w / lcd)}x${(_HEIGHT / lcd)}`;
}

export function findPreviewImage(isCompact, preview, thumbnail, oembed, width, needsNSFWBlur) {
  const imageWidth = isCompact ? POST_COMPACT_THUMBNAIL_WIDTH : width;

  if (isCompact && thumbnail && !needsNSFWBlur) {
    return {
      url: thumbnail,
      width: POST_COMPACT_THUMBNAIL_WIDTH,
      height: POST_COMPACT_THUMBNAIL_WIDTH,
    };
  }

  if (preview) {
    if (preview.images.length) {
      const bestFitPreviewImage = findBestFitPreviewImage(
        isCompact, preview.images[0], imageWidth, needsNSFWBlur);

      if (bestFitPreviewImage) {
        return bestFitPreviewImage;
      }
    }
  }

  if (oembed) {
    return oembedPreviewImage(oembed, needsNSFWBlur);
  }
}

/**
 * Returns the largest MP4 variant of a preview if that image
 * has both GIF and MP4 variants. This assumes that all GIF previews
 * will have both variants present. If that condition is not true,
 * we return null.
 * @returns {Object|null}
 */
export function findPreviewVideo(preview) {
  if (isEmpty(preview) || isEmpty(preview.images)) {
    return null;
  }

  const img = preview.images[0];
  // If image has both gif and mp4 variants, we must be looking at a gif.
  // Let's choose the MP4 variant to save on bandwidth.
  if (!(has(img, 'variants.gif.resolutions') &&
      has(img, 'variants.mp4.resolutions'))) {
    return null;
  }

  const variant = img.variants.mp4;

  if (!variant.resolutions) {
    return variant.source;
  }

  const largestFirst = variant.resolutions.sort((a, b) => {
    return b.width - a.width;
  });
  return largestFirst[0];
}

function findBestFitPreviewImage(isThumbnail, previewImage, imageWidth, needsNSFWBlur) {
  if (needsNSFWBlur) {
    // for logged out users and users who have the 'make safer for work'
    // option enabled there will be no nsfw variants returned.
    if (has(previewImage, 'variants.nsfw.resolutions')) {
      previewImage = previewImage.variants.nsfw;
    } else {
      return {};
    }
  }

  const resolutions = previewImage.resolutions;
  if (resolutions) {
    const bestFit = resolutions
      .sort((a, b) => {
        return a.width - b.width;
      })
      .find((r) => {
        if (isThumbnail) {
          return r.width >= imageWidth && r.height >= imageWidth;
        }

        return r.width >= imageWidth;
      });

    if (bestFit) {
      return bestFit;
    }
  }

  if (previewImage.source) {
    return previewImage.source;
  }
}

function oembedPreviewImage(oembed, needsNSFWBlur) {
  if (!needsNSFWBlur) {
    return {
      url: oembed.thumbnail_url,
      width: oembed.thumbnail_width,
      height: oembed.thumbnail_height,
    };
  }

  return {};
}
