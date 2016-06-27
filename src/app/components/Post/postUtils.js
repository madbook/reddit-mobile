import rootDomain from '../../../lib/rootDomain';

export function isPostNSFW(post) {
  if (!post || !post.title) {
    return false;
  }

  return !!post.title.match(/nsf[wl]/gi) || post.over18;
}

export function postShouldRenderMediaFullbleed(post) {
  const postHint = post.postHint;
  const media = post.media;
  return !!(postHint && postHint !== 'link' && postHint !== 'self' ||
    media && media.oembed && media.oembed.type !== 'rich' ||
    rootDomain(post.cleanUrl) === 'imgur.com' && post.preview);
}

export function isPostDomainExternal(post) {
  return post.domain !== `self.${post.subreddit}`;
}

export function cleanPostDomain(domain) {
  return (domain || '').replace(/\.com$/, '');
}

export function cleanPostHREF(href) {
  return (href || '').replace(/https?:\/\/i.imgur.com/, 'https://imgur.com');
}
