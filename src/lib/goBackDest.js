import { urlFromPage } from 'platform/pageUtils';

// Returns the url of the last page the user was on that's not in the
// excludedUrls. For example, when a user closes a modal while jumping between
// /login and /register should go to neither but back to the original page 
// they were on.
export default function goBackDest(platform, excludedUrls) {
  if (platform.currentPageIndex === 0) {
    return urlFromPage(platform.history[0]) || '/';
  }
  let i = platform.currentPageIndex - 1;
  if (!excludedUrls || excludedUrls.length === 0) {
    return urlFromPage(platform.history[i]);
  }

  let prevPage = platform.history[i];
  // Find the first url in history that isn't in the excluded urls
  while (i > 0 && excludedUrls.filter(url => url === prevPage.url).length > 0) {
    i--;
    prevPage = platform.history[i];
  }
  // Found a valid page if the last page not in excludedUrls else revert to frontpage
  if (excludedUrls.indexOf(prevPage.url) < 0) {
    return urlFromPage(prevPage);
  }
  return '/';
}
