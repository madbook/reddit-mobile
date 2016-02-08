export const SORTS = {
  CONFIDENCE: 'confidence',
  HOT: 'hot',
  NEW: 'new',
  RISING: 'rising',
  TOP: 'top',
  CONTROVERSIAL: 'controversial',
  OLD: 'old',
  QA: 'qa',
  GILDED: 'gilded',
  RELEVANCE: 'relevance',
  COMMENTS: 'comments',
  ALL_TIME: 'all',
  PAST_YEAR: 'year',
  PAST_MONTH: 'month',
  PAST_WEEK: 'week',
  PAST_DAY: 'day',
  PAST_HOUR: 'hour',
};

export const SORT_VALUES_MAP = {
  [SORTS.CONFIDENCE]: {
    text: 'Best',
    icon: 'icon-hot',
  },

  [SORTS.HOT]: {
    text: 'Hot',
    icon: 'icon-hot',
  },

  [SORTS.NEW]: {
    text: 'New',
    icon: 'icon-new',
  },

  [SORTS.RISING]: {
    text: 'Rising',
    icon: 'icon-hot',
  },

  [SORTS.TOP]: {
    text: 'Top',
    icon: 'icon-bar-chart',
  },

  [SORTS.CONTROVERSIAL]: {
    text: 'Controversial',
    icon: 'icon-controversial',
  },

  [SORTS.OLD]: {
    text: 'Old',
    icon: 'icon-text',
  },

  [SORTS.QA]: {
    text: 'Q&A',
    icon: 'icon-op',
  },

  [SORTS.GILDED]: {
    text: 'Gilded',
    icon: 'icon-gold',
  },

  [SORTS.RELEVANCE]: {
    text: 'Relevance',
    icon: 'icon-bar-chart',
  },

  [SORTS.COMMENTS]: {
    text: 'Comments',
    icon: 'icon-comments',
  },

  [SORTS.ALL_TIME]: {
    text: 'All Time',
    icon: 'icon-circle',
  },

  [SORTS.PAST_YEAR]: {
    text: 'Past Year',
    icon: 'icon-circle',
  },

  [SORTS.PAST_MONTH]: {
    text: 'Past Month',
    icon: 'icon-circle',
  },

  [SORTS.PAST_WEEK]: {
    text: 'Past Week',
    icon: 'icon-circle',
  },

  [SORTS.PAST_DAY]: {
    text: 'Past Day',
    icon: 'icon-circle',
  },

  [SORTS.PAST_HOUR]: {
    text: 'Past Hour',
    icon: 'icon-circle',
  },
};
