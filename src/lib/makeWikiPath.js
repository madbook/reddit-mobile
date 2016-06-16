export const makeWikiPath = (subredditName, path) => {
  const p = cleanWikiPath(path);

  if (subredditName) {
    return `r/${subredditName}/wiki/${p}`;
  }

  return `wiki/${p}`;
};

export const cleanWikiPath = (path) => {
  // Default to index when path is '' or undefined
  if (!path) {
    return 'index';
  }

  // Strip off the trailing slash
  return path.endsWith('/') ? path.slice(0, -1) : path;
};
