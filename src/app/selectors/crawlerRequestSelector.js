// Returns true if the current request is from a bot and we're on the server
export default state => {
  const { meta={} } = state;
  return meta.env === 'SERVER' && (meta.userAgent || '').indexOf('bot') > -1;
};
