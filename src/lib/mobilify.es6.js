function mobilify(url, origin) {
  return url.replace(/https?:\/\/(?:np\.)?(?:www\.)?reddit.com/g, origin || '');
}

export default mobilify;
