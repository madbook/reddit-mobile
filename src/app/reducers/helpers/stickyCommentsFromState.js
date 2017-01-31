import modelFromThingId from 'app/reducers/helpers/modelFromThingId';

/**
 * Returns a list of sticky comments in the current comments page.
 * @function
 * @param {Object} state
 * @returns {Object[]}
 */
export default function(state) {
  const { commentsPages } = state;
  if (!commentsPages) { return []; }

  const activePage = commentsPages[commentsPages.current];
  if (!(activePage && activePage.results.length)) { return []; }
  
  const stickiedComments = activePage.results.map(r => modelFromThingId(r.uuid, state))
                                             .filter(r => r.stickied);

  return stickiedComments;
}
