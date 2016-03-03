export function isPostNSFW(post) {
  if (!post || !post.title) {
    return false;
  }

  return !!post.title.match(/nsf[wl]/gi) || post.over_18;
}

export function isPostDomainExternal(post) {
  return post.domain !== `self.${post.subreddit}`;
}
