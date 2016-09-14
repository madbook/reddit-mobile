function mobilify(url, origin) {
  if (url) {
    return url.replace(/https?:\/\/(?:np\.)?(?:www\.)?reddit\.com\//g, `${origin || ''}/`);
  }

  return url;
}

export default mobilify;
