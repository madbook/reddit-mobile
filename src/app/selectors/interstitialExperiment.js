import { flags } from 'app/constants';

import { createSelector } from 'reselect';
import { featuresSelector } from 'app/selectors/features';
import { thumbnailSelector } from 'app/selectors/thumbnail';


const {
  VARIANT_XPROMO_SUBREDDIT,
  VARIANT_XPROMO_SUBREDDIT_TRANSPARENT,
  VARIANT_XPROMO_SUBREDDIT_EMBEDDED_APP,
  VARIANT_XPROMO_SUBREDDIT_POSTS,
  VARIANT_XPROMO_FP_GIF,
  VARIANT_XPROMO_FP_STATIC,
  VARIANT_XPROMO_FP_SPEED,
  VARIANT_XPROMO_FP_TRANSPARENT,
} = flags;


export const interstitialExperimentSelector = createSelector(
  featuresSelector,
  thumbnailSelector,
  (features, { thumbnails }) => {
    const showTransparency = (
      features.enabled(VARIANT_XPROMO_SUBREDDIT_TRANSPARENT) ||
      features.enabled(VARIANT_XPROMO_FP_TRANSPARENT)
    );
    const showSubredditPosts = (
      features.enabled(VARIANT_XPROMO_SUBREDDIT_POSTS)
    );
    const showEmbeddedApp = (
      features.enabled(VARIANT_XPROMO_SUBREDDIT_EMBEDDED_APP)
    );
    const showGifAppPreview = (
      features.enabled(VARIANT_XPROMO_FP_GIF)
    );
    const showSpeedAppPreview = (
      features.enabled(VARIANT_XPROMO_FP_SPEED)
    );
    let showStaticAppPreview = (
      features.enabled(VARIANT_XPROMO_FP_STATIC)
    );
    let showThumbnailGrid = (
      features.enabled(VARIANT_XPROMO_SUBREDDIT) && ! (
        features.enabled(VARIANT_XPROMO_SUBREDDIT_TRANSPARENT) ||
        features.enabled(VARIANT_XPROMO_SUBREDDIT_EMBEDDED_APP) ||
        features.enabled(VARIANT_XPROMO_SUBREDDIT_POSTS)
      )
    );

    if (showThumbnailGrid && thumbnails === null) {
      showThumbnailGrid = false;
      showStaticAppPreview = true;
    }
    return {
      showTransparency,
      showEmbeddedApp,
      showSubredditPosts,
      showStaticAppPreview,
      showGifAppPreview,
      showSpeedAppPreview,
      showThumbnailGrid,
    };
  }
);
