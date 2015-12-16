function randomString(len) {
  const id = [];
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < len; i++) {
    id.push(chars.charAt(Math.floor(Math.random() * chars.length)));
  }

  return id.join('');
}

export default randomString;
