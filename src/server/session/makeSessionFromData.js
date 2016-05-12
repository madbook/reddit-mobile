import Session from '../../app/models/Session';

export default data => {
  const now = new Date();

  return new Session({
    accessToken: data.access_token,
    tokenType: data.token_type,
    expires: now.setSeconds(now.getSeconds() + data.expires_in),
    refreshToken: data.refresh_token,
    scope: data.scope,
  });
};
