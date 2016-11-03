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

export const SUPPORTED_SORTS = [
  SORTS.HOT,
  SORTS.TOP,
  SORTS.NEW,
  SORTS.CONTROVERSIAL,
];

export const SORT_VALUES_MAP = {
  [SORTS.CONFIDENCE]: {
    text: 'Best',
    icon: 'hot',
  },

  [SORTS.HOT]: {
    text: 'Hot',
    icon: 'hot',
  },

  [SORTS.NEW]: {
    text: 'New',
    icon: 'new',
  },

  [SORTS.RISING]: {
    text: 'Rising',
    icon: 'hot',
  },

  [SORTS.TOP]: {
    text: 'Top',
    icon: 'bar-chart',
  },

  [SORTS.CONTROVERSIAL]: {
    text: 'Controversial',
    icon: 'controversial',
  },

  [SORTS.OLD]: {
    text: 'Old',
    icon: 'text',
  },

  [SORTS.QA]: {
    text: 'Q&A',
    icon: 'op',
  },

  [SORTS.GILDED]: {
    text: 'Gilded',
    icon: 'gold',
  },

  [SORTS.RELEVANCE]: {
    text: 'Relevance',
    icon: 'bar-chart',
  },

  [SORTS.COMMENTS]: {
    text: 'Comments',
    icon: 'comments',
  },

  [SORTS.ALL_TIME]: {
    text: 'All Time',
    icon: 'circle',
  },

  [SORTS.PAST_YEAR]: {
    text: 'Past Year',
    icon: 'circle',
  },

  [SORTS.PAST_MONTH]: {
    text: 'Past Month',
    icon: 'circle',
  },

  [SORTS.PAST_WEEK]: {
    text: 'Past Week',
    icon: 'circle',
  },

  [SORTS.PAST_DAY]: {
    text: 'Past Day',
    icon: 'circle',
  },

  [SORTS.PAST_HOUR]: {
    text: 'Past Hour',
    icon: 'circle',
  },
};
