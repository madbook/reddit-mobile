export const AD_LOCATION = 11;

export const GTM_JAIL_ID = 'gtm-jail';

export const ADBLOCK_TEST_ID = 'adblock-test';

export const TOGGLE_OVER_18 = 'toggleOver18';

export const USER_MENU_TOGGLE = 'sideNavToggle';

export const COMMUNITY_MENU_TOGGLE = 'community`MenuToggle';

export const TOP_NAV_HAMBURGER_CLICK = 'topNavHamburgerClick';

export const TOP_NAV_COMMUNITY_CLICK = 'topNavCommunityClick';

export const USER_DATA_CHANGED = 'userDataChanged';

export const VOTE = 'vote';

export const OVERLAY_MENU_OPEN = 'overlayMenuOpen';

export const OVERLAY_MENU_OFFSET = -10; // from cs;

export const OVERLAY_MENU_VISIBLE_CSS_CLASS = 'OverlayMenu-visible';

export const DROPDOWN_CSS_CLASS = 'Dropdown';

export const DROPDOWN_OPEN = 'dropdownOpen';

export const COMPACT_TOGGLE = 'compactToggle';

export const THEME_TOGGLE = 'themeToggle';

export const TOP_NAV_HEIGHT = 45;

export const RESIZE = 'resize';

export const SCROLL = 'scroll';

export const ICON_SHRUNK_SIZE = 16;

export const CACHEABLE_COOKIES = ['compact'];

export const DEFAULT_API_TIMEOUT = 10000;

export const HIDE_GLOBAL_MESSAGE = 'hideGlobalMessage';


export const EU_COOKIE_HIDE_AFTER_VIEWS = 3;

export const NEW_INFOBAR_MESSAGE = 'newInfoBarMessage';

export const messageTypes = {
  GLOBAL: 'global',
  EU_COOKIE: 'euCookie',
};

export const DEFAULT_KEY_COLOR = '#336699';

export const SET_META_COLOR = 'setMetaColor';

export const VISITED_POSTS_COUNT = 20;

export const RECENT_CLICKS_LENGTH = 5;

export const XPROMO_INTERSTITIAL_OPT_OUT = 'no_xpromo_interstitial';

// Post content

export const POST_COMPACT_THUMBNAIL_WIDTH = 70;

export const POST_DEFAULT_WIDTH = 320;

export const BANNER_URLS_DIRECT = {
  IOS: 'https://itunes.apple.com/us/app/reddit-the-official-app/id1064216828',
  ANDROID: 'https://play.google.com/store/apps/details?id=com.reddit.frontpage',
};
/* eslint-enable */

// feature flags
export const flags = {
  BETA: 'beta',
  SMARTBANNER: 'banner',
  USE_BRANCH: 'useBranch',
  VARIANT_NEXTCONTENT_BOTTOM: 'experimentNextContentBottom',
  VARIANT_RECOMMENDED_BOTTOM: 'experimentRecommendedBottom',
  VARIANT_RECOMMENDED_TOP: 'experimentRecommendedTop',
  VARIANT_RECOMMENDED_TOP_PLAIN: 'experimentRecommendedTopPlain',
  VARIANT_RECOMMENDED_BY_POST: 'experimentRecommendedByPost',
  VARIANT_RECOMMENDED_BY_POST_TOP_ALL: 'experimentRecommendedByPostTopAll',
  VARIANT_RECOMMENDED_BY_POST_TOP_DAY: 'experimentRecommendedByPostTopDay',
  VARIANT_RECOMMENDED_BY_POST_TOP_MONTH: 'experimentRecommendedByPostTopMonth',
  VARIANT_RECOMMENDED_BY_POST_HOT: 'experimentRecommendedByPostHot',
  VARIANT_RECOMMENDED_SIMILAR_POSTS: 'experimentRecommendedSimilarPosts',
  VARIANT_SUBREDDIT_HEADER: 'experimentSubredditHeader',
  VARIANT_XPROMO_FP_TRANSPARENT: 'experimentXPromoFrontPageTransparent',
  VARIANT_XPROMO_SUBREDDIT_TRANSPARENT: 'experimentXPromoSubredditTransparent',
  VARIANT_XPROMO_LOGIN_REQUIRED_FP_IOS: 'experimentXPromoLoginRequiredFPIOS',
  VARIANT_XPROMO_LOGIN_REQUIRED_FP_ANDROID: 'experimentXPromoLoginRequiredFPAndroid',
  VARIANT_XPROMO_LOGIN_REQUIRED_SUBREDDIT_IOS: 'experimentXPromoLoginRequiredSubredditIOS',
  VARIANT_XPROMO_LOGIN_REQUIRED_SUBREDDIT_ANDROID: 'experimentXPromoLoginRequiredSubredditAndroid',
  VARIANT_XPROMO_LOGIN_REQUIRED_FP_IOS_CONTROL: 'experimentXPromoLoginRequiredFPIOSControl',
  VARIANT_XPROMO_LOGIN_REQUIRED_FP_ANDROID_CONTROL: 'experimentXPromoLoginRequiredFPAndroidControl',
  VARIANT_XPROMO_LOGIN_REQUIRED_SUBREDDIT_IOS_CONTROL: 'experimentXPromoLoginRequiredSubredditIOSControl',
  VARIANT_XPROMO_LOGIN_REQUIRED_SUBREDDIT_ANDROID_CONTROL: 'experimentXPromoLoginRequiredSubredditAndroidControl',
  VARIANT_TITLE_EXPANDO: 'experimentTitleExpando',
  VARIANT_MIXED_VIEW: 'experimentMixedView',
  SHOW_AMP_LINK: 'showAmpLink',
};

export const themes = {
  NIGHTMODE: 'nightmode',
  DAYMODE: 'daymode',
};

export const LOGGEDOUT_REDIRECT = '/register';

export const loginErrors = {
  WRONG_PASSWORD: 'WRONG_PASSWORD',
  BAD_USERNAME: 'BAD_USERNAME',
  INCORRECT_USERNAME_PASSWORD: 'INCORRECT_USERNAME_PASSWORD',
};

export const genericErrors = {
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};
