function mobilify(url, origin) {
  return url.replace(/^https?:\/\/(?:www\.)?reddit.com/, origin || '');
}

export default mobilify;
