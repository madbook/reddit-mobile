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

export const XPROMO_LISTING_CLICK_EVENTS_NAME = 'listing_click';

export const XPROMO_LAST_LISTING_CLICK_DATE = 'lastListingClick';

/**
 * Listing clicks have a target type,
 * i.e. if you click on the username, the deeplink goes to the user profile,
 * and the target type is 'user'
 */
export const LISTING_CLICK_TYPES = {
  AUTHOR: 'author',
  COMMENTS_LINK: 'comments_link',
  CONTENT: 'content',
  DOMAIN_LINK: 'domain_link',
  FOOTER: 'footer',
  FOOTER_DROPDOWN: 'footer_dropdown',
  MOD_SHIELD: 'mod_shield', // we should never block mod actions,
  // if we see this in anayltics it indicates a bug with our implementation
  OTHER: 'other',
  SUBREDDIT: 'subreddit',
  THUMBNAIL: 'thumbnail',
  TITLE: 'title',
  VOTE_CONTROLS: 'vote_controls',
};

// Post content

export const POST_COMPACT_THUMBNAIL_WIDTH = 70;

export const POST_DEFAULT_WIDTH = 320;

export const BANNER_URLS_DIRECT = {
  IOS: 'https://itunes.apple.com/us/app/reddit-the-official-app/id1064216828',
  ANDROID: 'https://play.google.com/store/apps/details?id=com.reddit.frontpage',
};

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
  VARIANT_XPROMO_LOGIN_REQUIRED_IOS: 'experimentXPromoLoginRequiredIOS',
  VARIANT_XPROMO_LOGIN_REQUIRED_ANDROID: 'experimentXPromoLoginRequiredAndroid',
  VARIANT_XPROMO_LOGIN_REQUIRED_IOS_CONTROL: 'experimentXPromoLoginRequiredIOSControl',
  VARIANT_XPROMO_LOGIN_REQUIRED_ANDROID_CONTROL: 'experimentXPromoLoginRequiredAndroidControl',
  VARIANT_XPROMO_INTERSTITIAL_COMMENTS_IOS: 'experimentXPromoInterstitialCommentsIos',
  VARIANT_XPROMO_INTERSTITIAL_COMMENTS_ANDROID: 'experimentXPromoInterstitialCommentsAndroid',
  XPROMO_LISTING_CLICK_EVERY_TIME_COHORT: 'XPromoListingClickEveryTimeCohort',
  VARIANT_XPROMO_LISTING_CLICK_TWO_WEEK_IOS_ENABLED: 'experimentXPromoListingClickTwoWeekIOSEnabled',
  VARIANT_XPROMO_LISTING_CLICK_TWO_WEEK_ANDROID_ENABLED: 'experimentXPromoListingClickTwoWeekAndroidEnabled',
  VARIANT_XPROMO_LISTING_CLICK_EVERY_TIME_IOS_ENABLED: 'experimentXPromoListingClickEveryTimeIOSEnabled',
  VARIANT_XPROMO_LISTING_CLICK_EVERY_TIME_ANDROID_ENABLED: 'experimentXPromoListingClickEveryTimeAndroidEnabled',
  VARIANT_XPROMO_INTERSTITIAL_FREQUENCY_IOS: 'experimentXPromoInterstitialFrequencyIos',
  VARIANT_XPROMO_INTERSTITIAL_FREQUENCY_ANDROID: 'experimentXPromoInterstitialFrequencyAndroid',
  VARIANT_XPROMO_INTERSTITIAL_FREQUENCY_IOS_CONTROL: 'experimentXPromoInterstitialFrequencyIosControl',
  VARIANT_XPROMO_INTERSTITIAL_FREQUENCY_ANDROID_CONTROL: 'experimentXPromoInterstitialFrequencyAndroidControl',
  VARIANT_TITLE_EXPANDO: 'experimentTitleExpando',
  VARIANT_MIXED_VIEW: 'experimentMixedView',
  SHOW_AMP_LINK: 'showAmpLink',
};

export const xpromoDisplayTheme = {
  USUAL: 'transparent',
  MINIMAL: 'black_banner_fixed_bottom',
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

export const EVERY_DAY = 'every_day';
export const EVERY_THREE_DAYS = 'every_three_days';
export const EVERY_WEEK = 'every_week';
export const EVERY_TWO_WEEKS = 'every_two_weeks';

export const experimentFrequencyVariants = {};
experimentFrequencyVariants[EVERY_DAY] = 24 * 60 * 60 * 1000;
experimentFrequencyVariants[EVERY_THREE_DAYS] = 3 * 24 * 60 * 60 * 1000;
experimentFrequencyVariants[EVERY_WEEK] = 1 * 7 * 24 * 60 * 60 * 1000;
experimentFrequencyVariants[EVERY_TWO_WEEKS] = 2 * 7 * 24 * 60 * 60 * 1000;

export const localstorage = {
  BANNER_LAST_CLOSED : 'bannerLastClosed',
};
