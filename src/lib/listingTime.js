import { SORTS } from 'app/sortValues';

const TIME_FILTERABLE_SORTS = new Set([SORTS.TOP, SORTS.CONTROVERSIAL]);

export const listingTime = (query, sort)=> {
  if (TIME_FILTERABLE_SORTS.has(sort)) {
    return query.t || query.time || SORTS.PAST_DAY;
  }
};
