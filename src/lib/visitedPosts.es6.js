import { take, uniq } from 'lodash/array';

import constants from '../constants';
import localStorageAvailable from './localStorageAvailable';

// Return an array of ids of the posts the user has visited recently.
// Return [] if we are unable to access such a list.
export function getVisitedPosts() {
  if (!localStorageAvailable()) {
    return [];
  }

  const visitedString = global.localStorage.getItem(constants.VISITED_POSTS_KEY);
  if (!visitedString) {
    return [];
  }

  if (!visitedString.startsWith('[')) {
    // Old format -- comma separated string
    return visitedString.split(',');
  }

  return JSON.parse(visitedString);
}

// Stores the array of recently-visited post IDs.
// Stores only unique IDs and limited to VISITED_POST_COUNT.
// The posts should be provided in descending chronological order (most-recent
// first), so that the implementation provides us with the most recently
// visited posts.
// If we cannot store the list (no localStorage), then this is a silent no-op.
export function setVisitedPosts(posts) {
  if (localStorageAvailable()) {
    const visited = JSON.stringify(take(uniq(posts), constants.VISITED_POST_COUNT));
    global.localStorage.setItem(constants.VISITED_POSTS_KEY, visited);
  }
}

